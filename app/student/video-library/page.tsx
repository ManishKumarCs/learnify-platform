"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Play, Clock, Search, Filter, Star } from "lucide-react"

interface Video {
  id: string
  title: string
  instructor: string
  duration: string
  category: string
  difficulty: string
  rating: number
  views: number
  thumbnail: string
  watched: boolean
}

export default function VideoLibraryPage() {
  const [videos, setVideos] = useState<Video[]>([
    {
      id: "1",
      title: "Introduction to Data Structures",
      instructor: "Dr. Sarah Chen",
      duration: "45:30",
      category: "Data Structures",
      difficulty: "Beginner",
      rating: 4.8,
      views: 2500,
      thumbnail: "/data-structures.jpg",
      watched: true,
    },
    {
      id: "2",
      title: "Advanced Algorithms Explained",
      instructor: "Prof. James Wilson",
      duration: "62:15",
      category: "Algorithms",
      difficulty: "Advanced",
      rating: 4.9,
      views: 1800,
      thumbnail: "/abstract-algorithms.png",
      watched: false,
    },
    {
      id: "3",
      title: "Aptitude Problem Solving",
      instructor: "Ms. Priya Sharma",
      duration: "38:45",
      category: "Aptitude",
      difficulty: "Intermediate",
      rating: 4.7,
      views: 3200,
      thumbnail: "/aptitude.jpg",
      watched: true,
    },
  ])

  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")

  const categories = ["All", "Data Structures", "Algorithms", "Aptitude", "Programming"]

  const filteredVideos = videos.filter(
    (v) =>
      (selectedCategory === "All" || v.category === selectedCategory) &&
      (v.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.instructor.toLowerCase().includes(searchTerm.toLowerCase())),
  )

  return (
    <div className="space-y-6 p-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Video Library</h1>
        <p className="text-muted-foreground">Learn from expert instructors with comprehensive video tutorials</p>
      </div>

      {/* Search and Filter */}
      <div className="space-y-4">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search videos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
        </div>

        {/* Category Filter */}
        <div className="flex gap-2 flex-wrap">
          {categories.map((cat) => (
            <Badge
              key={cat}
              variant={selectedCategory === cat ? "default" : "outline"}
              className="cursor-pointer px-3 py-1.5 transition-all hover:scale-105"
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </Badge>
          ))}
        </div>
      </div>

      {/* Videos Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredVideos.map((video) => (
          <Card
            key={video.id}
            className="overflow-hidden hover:shadow-lg transition-all duration-300 group cursor-pointer"
          >
            <div className="relative overflow-hidden bg-muted h-40">
              <img
                src={video.thumbnail || "/placeholder.svg"}
                alt={video.title}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors flex items-center justify-center">
                <Play className="h-12 w-12 text-white opacity-80 group-hover:opacity-100 transition-opacity" />
              </div>
              <Badge className="absolute top-2 right-2 bg-primary/90">{video.difficulty}</Badge>
              {video.watched && <Badge className="absolute top-2 left-2 bg-green-500/90">Watched</Badge>}
              <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {video.duration}
              </div>
            </div>

            <CardContent className="p-4 space-y-3">
              <div>
                <h3 className="font-semibold line-clamp-2 group-hover:text-primary transition-colors">{video.title}</h3>
                <p className="text-sm text-muted-foreground mt-1">{video.instructor}</p>
              </div>

              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-semibold">{video.rating}</span>
                </div>
                <span className="text-muted-foreground">{video.views.toLocaleString()} views</span>
              </div>

              <div className="flex gap-2">
                <Badge variant="secondary" className="text-xs">
                  {video.category}
                </Badge>
              </div>

              <Button className="w-full gap-2 bg-primary hover:bg-primary/90">
                <Play className="h-4 w-4" />
                Watch Now
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
