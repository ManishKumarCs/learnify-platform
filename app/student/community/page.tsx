"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Heart, MessageCircle, Search, Filter } from "lucide-react"

interface Discussion {
  id: string
  title: string
  author: string
  category: string
  replies: number
  likes: number
  timestamp: string
  preview: string
  solved: boolean
}

export default function CommunityPage() {
  const [discussions, setDiscussions] = useState<Discussion[]>([
    {
      id: "1",
      title: "How to solve dynamic programming problems efficiently?",
      author: "Student Member",
      category: "Programming",
      replies: 12,
      likes: 45,
      timestamp: "2 hours ago",
      preview: "I am struggling with DP problems. Can anyone explain the approach?",
      solved: true,
    },
    {
      id: "2",
      title: "Best resources for learning Data Structures",
      author: "Community Member",
      category: "Resources",
      replies: 8,
      likes: 32,
      timestamp: "5 hours ago",
      preview: "Looking for comprehensive resources to master data structures...",
      solved: false,
    },
  ])

  const [newDiscussion, setNewDiscussion] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")

  const categories = ["All", "Programming", "Aptitude", "Resources", "General"]

  const handlePostDiscussion = () => {
    if (newDiscussion.trim()) {
      const discussion: Discussion = {
        id: String(discussions.length + 1),
        title: newDiscussion.split("\n")[0],
        author: "You",
        category: selectedCategory,
        replies: 0,
        likes: 0,
        timestamp: "just now",
        preview: newDiscussion,
        solved: false,
      }
      setDiscussions([discussion, ...discussions])
      setNewDiscussion("")
    }
  }

  const filteredDiscussions = discussions.filter(
    (d) =>
      (selectedCategory === "All" || d.category === selectedCategory) &&
      (d.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.preview.toLowerCase().includes(searchTerm.toLowerCase())),
  )

  return (
    <div className="space-y-6 p-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Community Forum</h1>
        <p className="text-muted-foreground">Connect with peers, ask questions, and share knowledge</p>
      </div>

      {/* New Discussion Card */}
      <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5">
        <CardHeader>
          <CardTitle className="text-lg">Start a Discussion</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="What's on your mind? Ask a question or share your thoughts..."
            value={newDiscussion}
            onChange={(e) => setNewDiscussion(e.target.value)}
            className="min-h-24 resize-none"
          />
          <div className="flex gap-2">
            <Button onClick={handlePostDiscussion} className="flex-1 bg-primary hover:bg-primary/90">
              Post Discussion
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Search and Filter */}
      <div className="space-y-4">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search discussions..."
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

      {/* Discussions List */}
      <div className="space-y-3">
        {filteredDiscussions.map((discussion) => (
          <Card
            key={discussion.id}
            className="hover:shadow-lg transition-all duration-300 cursor-pointer hover:border-primary/50 group"
          >
            <CardContent className="p-4">
              <div className="flex gap-4">
                <div className="flex-1 space-y-2">
                  <div className="flex items-start gap-2">
                    <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
                      {discussion.title}
                    </h3>
                    {discussion.solved && (
                      <Badge className="bg-green-500/20 text-green-700 dark:text-green-400">Solved</Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">{discussion.preview}</p>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span>by {discussion.author}</span>
                    <span>•</span>
                    <span>{discussion.timestamp}</span>
                    <span>•</span>
                    <Badge variant="secondary" className="text-xs">
                      {discussion.category}
                    </Badge>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2 text-sm">
                  <div className="flex gap-3 text-muted-foreground">
                    <div className="flex items-center gap-1 hover:text-primary transition-colors">
                      <Heart className="h-4 w-4" />
                      <span>{discussion.likes}</span>
                    </div>
                    <div className="flex items-center gap-1 hover:text-primary transition-colors">
                      <MessageCircle className="h-4 w-4" />
                      <span>{discussion.replies}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
