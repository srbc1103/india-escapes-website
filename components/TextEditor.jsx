"use client";

import { useEffect, useState, useRef } from "react";
import { Editor } from '@tinymce/tinymce-react';

export default function TextEditor(props){
  let {value, onChange, inModal = false} = props
  let [value1,setValue] = useState(value)
  const editorRef = useRef(null)

  function handleEditorChange(content, editor) {
    onChange(content)
    setValue(content)
  }

  useEffect(()=>{
    setValue(value)
  },[value])

  return (
    <Editor
      apiKey='64jruy956r2oe8blybughxotvaav28ye9g0pw3xu1a3f88aw'
      onInit={(evt, editor) => {
        editorRef.current = editor
        // Ensure TinyMCE UI renders in body when in modal
        if (inModal && editor.editorContainer) {
          editor.editorContainer.style.position = 'relative'
          editor.editorContainer.style.zIndex = 'auto'
        }
      }}
      init={{
        plugins: [
          'anchor', 'autolink', 'charmap', 'emoticons', 'image', 'link', 'lists', 'media', 'searchreplace', 'table', 'visualblocks', 'wordcount'
        ],
        toolbar: 'undo redo | blocks fontfamily fontsize | bold italic underline strikethrough | link image media table mergetags | addcomment showcomments | spellcheckdialog a11ycheck typography | align lineheight | checklist numlist bullist indent outdent | emoticons charmap | removeformat',
        ai_request: (request, respondWith) => respondWith.string(() => Promise.reject('See docs to implement AI Assistant')),
        promotion: false,
        // Fix z-index and positioning issues when editor is used inside modals/popups
        z_index: inModal ? 100001 : 1000,
        z_index_lightbox: inModal ? 100002 : 1001,
        // Force all UI elements (menus, dialogs, etc.) to use high z-index
        ...(inModal && {
          setup: (editor) => {
            editor.on('init', () => {
              // Force menus and dialogs to render with proper z-index
              const style = document.createElement('style')
              style.textContent = `
                body > .tox-tinymce-aux {
                  z-index: 100001 !important;
                }
              `
              document.head.appendChild(style)
            })
          }
        })
      }}
      value={value1}
      onEditorChange={handleEditorChange}
    />
  );
}