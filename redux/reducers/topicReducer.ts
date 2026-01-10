import { createReducer } from "@reduxjs/toolkit";
import {
    getAllTopics,
    getTopic,
    getTopicBySlug,
    getTrendingTopics,
    getTopicsWithFirstEntry,
    createTopic,
    updateTopic,
    deleteTopic,
    followTopic,
    unfollowTopic,
    getFollowedTopics,
    clearCurrentTopic,
    Topic
} from "../actions/topicActions";
import { likeEntry, dislikeEntry, toggleFavorite } from "../actions/entryActions";

interface TopicState {
    topics: Topic[];
    currentTopic: Topic | null;
    followedTopics: Topic[];
    loading: boolean;
    error: string | null;
    message: string | null;
}

const initialState: TopicState = {
    topics: [],
    currentTopic: null,
    followedTopics: [],
    loading: false,
    error: null,
    message: null,
};

export const topicReducer = createReducer(initialState, (builder) => {
    builder
        // Get all topics
        .addCase(getAllTopics.pending, (state) => {
            state.loading = true;
            state.error = null;
        })
        .addCase(getAllTopics.fulfilled, (state, action) => {
            state.loading = false;
            state.topics = action.payload;
            state.error = null;
        })
        .addCase(getAllTopics.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload as string;
        })

        // Get single topic
        .addCase(getTopic.pending, (state) => {
            state.loading = true;
            state.error = null;
        })
        .addCase(getTopic.fulfilled, (state, action) => {
            state.loading = false;
            state.currentTopic = action.payload;
            state.error = null;
        })
        .addCase(getTopic.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload as string;
        })

        // Get topic by slug
        .addCase(getTopicBySlug.pending, (state) => {
            state.loading = true;
            state.error = null;
            state.currentTopic = null;
        })
        .addCase(getTopicBySlug.fulfilled, (state, action) => {
            state.loading = false;
            state.currentTopic = action.payload;
            state.error = null;
        })
        .addCase(getTopicBySlug.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload as string;
        })

        // Get trending topics
        .addCase(getTrendingTopics.pending, (state) => {
            state.loading = true;
            state.error = null;
        })
        .addCase(getTrendingTopics.fulfilled, (state, action) => {
            state.loading = false;
            state.topics = action.payload;
            state.error = null;
        })
        .addCase(getTrendingTopics.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload as string;
        })

        // Get topics with first entry
        .addCase(getTopicsWithFirstEntry.pending, (state) => {
            state.loading = true;
            state.error = null;
        })
        .addCase(getTopicsWithFirstEntry.fulfilled, (state, action) => {
            state.loading = false;
            state.topics = action.payload;
            state.error = null;
        })
        .addCase(getTopicsWithFirstEntry.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload as string;
        })

        // Create topic
        .addCase(createTopic.pending, (state) => {
            state.loading = true;
            state.error = null;
        })
        .addCase(createTopic.fulfilled, (state, action) => {
            state.loading = false;
            state.topics.push(action.payload);
            state.message = "Topic başarıyla oluşturuldu";
            state.error = null;
        })
        .addCase(createTopic.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload as string;
        })

        // Update topic
        .addCase(updateTopic.pending, (state) => {
            state.loading = true;
            state.error = null;
        })
        .addCase(updateTopic.fulfilled, (state, action) => {
            state.loading = false;
            const index = state.topics.findIndex(t => t._id === action.payload._id);
            if (index !== -1) {
                state.topics[index] = action.payload;
            }
            state.message = "Topic başarıyla güncellendi";
            state.error = null;
        })
        .addCase(updateTopic.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload as string;
        })

        // Delete topic
        .addCase(deleteTopic.pending, (state) => {
            state.loading = true;
            state.error = null;
        })
        .addCase(deleteTopic.fulfilled, (state, action) => {
            state.loading = false;
            state.topics = state.topics.filter(t => t._id !== action.payload);
            state.message = "Topic başarıyla silindi";
            state.error = null;
        })
        .addCase(deleteTopic.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload as string;
        })

        // Handle Entry Reactions for firstEntry in topics list
        .addCase(likeEntry.fulfilled, (state, action) => {
            const { id, likeCount, dislikeCount, likes, dislikes } = action.payload;
            state.topics = state.topics.map(topic => {
                if (topic.firstEntry && topic.firstEntry._id === id) {
                    return {
                        ...topic,
                        firstEntry: {
                            ...topic.firstEntry,
                            likeCount,
                            dislikeCount,
                            likes,
                            dislikes
                        }
                    };
                }
                return topic;
            });
        })
        .addCase(dislikeEntry.fulfilled, (state, action) => {
            const { id, likeCount, dislikeCount, likes, dislikes } = action.payload;
            state.topics = state.topics.map(topic => {
                if (topic.firstEntry && topic.firstEntry._id === id) {
                    return {
                        ...topic,
                        firstEntry: {
                            ...topic.firstEntry,
                            likeCount,
                            dislikeCount,
                            likes,
                            dislikes
                        }
                    };
                }
                return topic;
            });
        })
        .addCase(toggleFavorite.fulfilled, (state, action) => {
            const { id, favoriteCount, favorites } = action.payload;
            state.topics = state.topics.map(topic => {
                if (topic.firstEntry && topic.firstEntry._id === id) {
                    return {
                        ...topic,
                        firstEntry: {
                            ...topic.firstEntry,
                            favoriteCount,
                            favorites
                        }
                    };
                }
                return topic;
            });
        })

        // Follow topic
        .addCase(followTopic.fulfilled, (state, action) => {
            state.message = "Başlık takip edildi";
        })
        .addCase(followTopic.rejected, (state, action) => {
            state.error = action.payload as string;
        })

        // Unfollow topic
        .addCase(unfollowTopic.fulfilled, (state, action) => {
            state.message = "Başlık takipten çıkarıldı";
        })
        .addCase(unfollowTopic.rejected, (state, action) => {
            state.error = action.payload as string;
        })

        // Get followed topics
        .addCase(getFollowedTopics.pending, (state) => {
            state.loading = true;
        })
        .addCase(getFollowedTopics.fulfilled, (state, action) => {
            state.loading = false;
            state.followedTopics = action.payload;
        })
        .addCase(getFollowedTopics.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload as string;
        })

        // Clear current topic
        .addCase(clearCurrentTopic, (state) => {
            state.currentTopic = null;
            state.error = null;
        });
});

export default topicReducer;
