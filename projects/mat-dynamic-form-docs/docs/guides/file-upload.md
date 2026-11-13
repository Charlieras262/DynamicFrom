---
sidebar_position: 4
title: File upload
---

# File upload

`InputFile` is a drag-and-drop file field. The control value is the selected `File` (or `null`).

```ts
new InputFile('avatar', 'Profile picture').apply({
  accept: ['png', 'jpg'],
  maxSize: 2,
  filename: 'avatar',
  hint: 'PNG or JPG, 2 MB max',
  errorMessage: 'The selected file is not valid',
  onStatusChange: (change) => console.log(change.state, change.message),
});
```

:::info Icons
The field shows an icon per file type. Copy the library assets into your build as explained in
[Installation](../getting-started/installation.mdx#4-copy-the-file-upload-icons).
:::

## Properties

| Property | Description |
| --- | --- |
| `accept` | Allowed extensions, without the dot (`['png', 'pdf']`). Empty or not set: any file. |
| `maxSize` | Maximum size in **MB**. Not set: no limit. |
| `filename` | Renames the selected file (the extension is kept). |
| `dragLabel` | Text shown while dragging. Default `Drop files here`. |
| `downloadHint` / `removeHint` / `retryHint` | Tooltips of the download, remove and retry buttons. |
| `onStatusChange` | Callback with a `FileChange` every time the state changes. |

## Validation

A file is rejected when:

| Error | Reason |
| --- | --- |
| `maxFileSize` | It is bigger than `maxSize`. |
| `badFileFormat` | Its type is not in `accept`. |
| `corruptFileFormat` | Its extension does not match its MIME type (for example a PNG named `photo.jpg`). |

A rejected file leaves the control value as `null` with the `error` validation error, shows `errorMessage`, and
displays **retry** (opens the file selector again) and **remove** buttons.

## Status changes

```ts
type FileState = 'none' | 'preparing' | 'valid' | 'error';

interface FileChange {
  state: FileState;
  message?: string;
  error?: string; // maxFileSize | badFileFormat | corruptFileFormat
}
```

A successful selection emits `preparing` and then `valid`. Removing the file emits `none`. Resetting the form
also returns the field to its initial state.

## FileUtils

`FileUtils` is exported for your own file handling:

| Method | Description |
| --- | --- |
| `saveAs(file, fileName)` | Downloads a `File` or `Blob`. |
| `saveAsHeaders(file, headers)` | Downloads using the name from the `Content-Disposition` header. |
| `isValidFile(file, accept, maxSizeMb)` | Runs the validation described above. |
| `changeFileName(file, newName)` | Returns a renamed copy, keeping the extension. |
| `getFileExtension(mimeType)` / `getMimeType(extension)` | Converts between MIME types and extensions. |
| `createFileList(files)` | Builds a `FileList`. |
