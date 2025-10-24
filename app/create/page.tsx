import Editor from "@/components/editor"

export default async function CreatePage() {
  // Note: In a real app, you'd check auth on the server
  // For now, the Editor component handles the redirect
  return <Editor />
}
