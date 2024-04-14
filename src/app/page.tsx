'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/components/ui/use-toast";
import { Cross1Icon, ReloadIcon, ThickArrowDownIcon, ThickArrowUpIcon, UploadIcon } from "@radix-ui/react-icons";
import { useRef, useState } from "react";

export default function Home() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [comments, setComments] = useState<string[]>([]);
  const [votes, setVotes] = useState<{ positive: number; negative: number; }>({ positive: 0, negative: 0});

  const onChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNewComment(e.target.value);
  }

  const onSubmit = async () => {
    try {
      setLoading(true);
        
      const response = await fetch('/api/comment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ comment: newComment }),
      });
      const data: { allow: boolean, message: string, sentiment: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL' } = await response.json();
      
      if (!!data?.allow) {
        setComments([...comments, newComment]);
        setVotes((prev) => ({
          positive: data.sentiment === 'POSITIVE' ? prev.positive + 1 : prev.positive,
          negative: data.sentiment === 'NEGATIVE' ? prev.negative + 1 : prev.negative,
        }))
      } else {
        toast({
          variant: "destructive",
          title: "Uh oh! Your comment cannot be submitted.",
          description: data?.message || "Please try again later.",
        })
      }
      setNewComment('');

    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <h1 className="text-5xl font-bold">Welcome to the Comment System</h1>
      <div className="w-full space-y-4 max-w-lg">
        <div className="flex items-start">
          <div className="space-y-2 flex flex-col justify-center mr-4">
            <div className="flex items-center space-x-2">
              <ThickArrowUpIcon className="size-4 text-green-500 fill-black" />
              <span>{votes.positive}</span>
            </div>
            <div className="flex items-center space-x-2">
              <ThickArrowDownIcon className="size-4 text-red-500" />
              <span>{votes.negative}</span>
            </div>
          </div>
          <div className="space-y-2 w-full">
            <Textarea
              name="comment"
              placeholder="type your comment"
              value={newComment}
              onChange={onChange}
            />
            <div className="space-x-2 space-y-2">
              <Button onClick={onSubmit} disabled={loading}>{
                loading ? <><ReloadIcon className="mr-2 h-4 w-4 animate-spin" />Please wait</> : 'Submit'
              }</Button>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        {comments.map((comment, index) => (
          <Card key={`card_${index}`}>
            <CardContent className="grid gap-4 p-4">
              <div
                key={index}
                className="mb-4 items-start pb-4 last:mb-0 last:pb-0"
              >
                {index + 1}. {comment}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <Toaster />
    </main>
  );
}
