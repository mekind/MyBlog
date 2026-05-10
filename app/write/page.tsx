import NoteEditor from "@/components/NoteEditor";

export default function WritePage() {
  return (
    <NoteEditor
      mode="create"
      initial={{
        title: "",
        slug: "",
        isPrivate: false,
        tags: "",
        body: "",
      }}
    />
  );
}
