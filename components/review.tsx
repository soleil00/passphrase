"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { useAppDispatch, useAppSelector } from "@/redux/hooks"
import { createFeedback, fetchFeedbacks } from "@/redux/slices/reviews"
import AuthenticationModal from "./authentication-modal"

interface Feedback {
  id: string
  comment: string
  rating: number
  date: Date
  image?: string
}

export default function CustomerFeedback() {
  // State for form inputs
  const [comment, setComment] = useState("")
  const [rating, setRating] = useState(0)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [image, setImage] = useState<string | null>(null)
  const [loading, setLoading] = useState(false) 
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false) 

  const dispatch = useAppDispatch()
  const { feedbacks } = useAppSelector((state) => state.reviews)
  const { currentUser } = useAppSelector((state) => state.auth)

  // Add this new state for client-side rendering detection:
  const [isClient, setIsClient] = useState(false)

  // Add this useEffect to detect client-side rendering:
  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true) // Start loading
      await dispatch(fetchFeedbacks())
      setLoading(false) // End loading
    }
    fetchData()
  }, [dispatch])

  // Calculate average rating function
  const calculateAverageRating = () => {
    if (feedbacks.length === 0) {
      return 0
    }
    const total = feedbacks.reduce((sum, item) => sum + item.rating, 0)
    return Number.parseFloat((total / feedbacks.length).toFixed(1))
  }

  // Handle image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        setImage(event.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  // Submit new feedback
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!comment || rating === 0) return
    if (!currentUser) {
      setIsAuthModalOpen(true)
      return
    }

    setLoading(true) // Start loading
    await dispatch(
      createFeedback({
        comment,
        rating,
      }),
    ).unwrap()
    setLoading(false) // End loading

    // Reset form
    setComment("")
    setRating(0)
    setImage(null)

    // Reset file input
    const fileInput = document.getElementById("image-upload") as HTMLInputElement
    if (fileInput) fileInput.value = ""
  }

  // Replace the formatDate function with this improved version that handles different date formats and invalid values
  const formatDate = (dateInput: Date | string | number | undefined) => {
    if (!dateInput) {
      return "N/A" // Return a placeholder for undefined/null dates
    }

    try {
      // Convert string dates to Date objects if needed
      const date = typeof dateInput === "string" || typeof dateInput === "number" ? new Date(dateInput) : dateInput

      // Check if the date is valid
      if (isNaN(date.getTime())) {
        return "Invalid date"
      }

      return new Intl.DateTimeFormat("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      }).format(date)
    } catch (error) {
      console.error("Error formatting date:", error)
      return "Invalid date"
    }
  }

  return (
    <div className=" mx-auto">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold mb-2">Customer Feedback</h1>
        <div className="flex items-center justify-center gap-4">
          <div className="flex items-center">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`w-6 h-6 ${
                  star <= Math.round(calculateAverageRating())
                    ? "fill-primary text-primary"
                    : "fill-muted text-muted-foreground"
                }`}
              />
            ))}
          </div>
          <span className="text-xl font-semibold">{isClient ? calculateAverageRating() : "-"}</span>
          <span className="text-muted-foreground">({feedbacks.length} reviews)</span>
        </div>
      </div>
      {loading && <div className="text-center">Loading...</div>} {/* Loader for fetching reviews */}
      <div className="space-y-3 mb-3">
        <h2 className="text-2xl font-bold">Customer Reviews</h2>

        {feedbacks.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">No reviews yet. Be the first to leave feedback!</p>
        ) : (
          feedbacks.map((feedback, index) => (
            <div key={feedback._id}>
              <div className="flex gap-4">
                <Avatar className="w-10 h-10 border">
                  <AvatarFallback>{feedback.username.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 space-">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold">{feedback.username.slice(0, -3) + "***"}</h3>
                      <p className="text-sm text-muted-foreground">{formatDate(feedback.createdAt)}</p>
                    </div>
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-5 h-5 ${
                            star <= feedback.rating ? "fill-primary text-primary" : "fill-muted text-muted-foreground"
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  <p className="text-sm">{feedback.comment}</p>

                  {feedback.image && (
                    <img
                      src={feedback.image || "/placeholder.svg"}
                      alt={`${feedback.username}'s uploaded image`}
                      className="mt-2 max-h-60 rounded-md border"
                    />
                  )}
                </div>
              </div>

              {index < feedbacks.length - 1 && <Separator className="my-2" />}
            </div>
          ))
        )}
      </div>
      <Card className="mb-2">
        <CardHeader>
          <CardTitle>Share Your Experience</CardTitle>
          <CardDescription>
            We value your feedback! Please let us know what you think about our product.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="rating">Rating</Label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-6 h-6 cursor-pointer ${
                      star <= (hoveredRating || rating)
                        ? "fill-primary text-primary"
                        : "fill-muted text-muted-foreground"
                    }`}
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoveredRating(star)}
                    onMouseLeave={() => setHoveredRating(0)}
                  />
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="comment">Your Comment</Label>
              <Textarea
                id="comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share your thoughts about our product"
                required
                rows={4}
              />
            </div>

            {/* <div className="space-y-2">
              <Label htmlFor="image-upload">Add Image (Optional)</Label>
              <Input
                id="image-upload"
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="cursor-pointer"
              />

              {image && (
                <div className="mt-2">
                  <p className="text-sm text-muted-foreground mb-1">Preview:</p>
                  <img src={image || "/placeholder.svg"} alt="Preview" className="max-h-40 rounded-md border" />
                  <Button type="button" variant="outline" size="sm" className="mt-2" onClick={() => setImage(null)}>
                    Remove Image
                  </Button>
                </div>
              )}
            </div> */}
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={loading}>
              {" "}
              {/* Disable button while loading */}
              {loading ? "Submitting..." : "Submit Feedback"}
            </Button>
          </CardFooter>
        </form>
      </Card>

      <AuthenticationModal isOpen={isAuthModalOpen} onClose={()=>setIsAuthModalOpen(false)} />
    </div>
  )
}

