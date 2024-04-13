'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/components/ui/use-toast";
import { Cross1Icon, ReloadIcon, UploadIcon } from "@radix-ui/react-icons";
import { useRef, useState } from "react";

export const runtime = "edge"

export default function Home() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [comments, setComments] = useState<string[]>([]);
  const [inputFile, setInputFile] = useState<File | null>(null);
  const inputRef = useRef<HTMLInputElement>();

  const onChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNewComment(e.target.value);
  }

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setInputFile(file);
    }
  }

  const onSubmit = async () => {
    try {
      setLoading(true);
      /* const inputs = {
        image: [...new Uint8Array(blob)],
      };
  
      const imageResponse = await ai.run(
        "@cf/microsoft/resnet-50",
        inputs
      ); */
  
      const response = await fetch('/api/hello', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ comment: newComment }),
      });
      const data: { allow: boolean, message: string } = await response.json();
      console.log(data);
      if (!!data?.allow) {
        setComments([...comments, newComment]);
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
      <div className="w-full space-y-4">
        <div className="relative">
          <Textarea
            name="comment"
            placeholder="type your comment"
            value={newComment}
            onChange={onChange}
          />
          <input className="hidden" type="file" ref={inputRef as React.RefObject<HTMLInputElement>} onChange={onInputChange}/>
        </div>
        <div className="space-x-2 space-y-2">
          <div className="flex space-x-2 items-center">
            {inputFile && 
            <>
              <img src={URL.createObjectURL(inputFile)} alt="preview" className="h-10 w-10 object-cover rounded-md" />
              <span>{inputFile?.name}</span>
              <span onClick={() => setInputFile(null)}><Cross1Icon className="text-red-500 cursor-pointer" /></span>
            </>
              }
          </div>
          <Button onClick={() => {
            // clear input value
            if (inputRef.current) {
              inputRef.current.value = '';
              inputRef.current?.click();
            }
          }} disabled={loading}>{
            loading ?
              <><ReloadIcon className="mr-2 h-4 w-4 animate-spin" />Uploading</>
            : <><UploadIcon className="mr-2 h-3 w-3" />Image</>
          }</Button>
          <Button onClick={onSubmit} disabled={loading}>{
            loading ? <><ReloadIcon className="mr-2 h-4 w-4 animate-spin" />Please wait</> : 'Submit'
          }</Button>
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
