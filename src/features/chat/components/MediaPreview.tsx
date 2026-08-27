type Props = {
  file?: File;
};

export default function MediaPreview({ file }: Props) {
  if (!file) return null;

  return (
    <div>
      <p>{file.name}</p>
      <small>Ready to send</small>
    </div>
  );
}
