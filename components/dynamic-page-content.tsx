"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { server } from "@/config"
import { notFound } from "next/navigation"

interface DynamicPageContentProps {
    slug: string
}

export function DynamicPageContent({ slug }: DynamicPageContentProps) {
    const [page, setPage] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchPage = async () => {
            try {
                const { data } = await axios.get(`${server}/pages/${slug}`)
                setPage(data.page)
            } catch (error) {
                console.error("Page fetch error:", error)
            } finally {
                setLoading(false)
            }
        }
        fetchPage()
    }, [slug])

    if (loading) {
        return (
            <div className="w-full bg-white flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#4729ff]"></div>
            </div>
        )
    }

    if (!page) {
        return notFound()
    }

    return (
        <div className="w-full bg-white">
            <div className="max-w-[1400px] mx-auto px-6 lg:px-8 py-8">
                <div className="max-w-3xl mx-auto">
                    <h1 className="text-2xl font-bold text-slate-900 mb-8">{page.title}</h1>
                    <div
                        className="prose prose-slate max-w-none text-slate-700 leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: page.content }}
                    />
                </div>
            </div>
        </div>
    )
}
