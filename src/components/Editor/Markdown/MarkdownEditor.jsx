// https://v0.dev/chat/markdown-editor-9R3UgCySWh4 // 

import { useState, useRef } from "react";
import { Bold, Italic, Heading1, Heading2, Heading3, List, ListOrdered, Link, Image, Code, Quote } from "lucide-react";

export default function MarkdownEditor ( { markdown, onChange } ) {
    const textareaRef = useRef( null );
    const [ codeLanguage, setCodeLanguage ] = useState( "javascript" );

    const insertText = ( before, after = "" ) => {
        const textarea = textareaRef.current;
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const selectedText = markdown.substring( start, end );

        const newText = markdown.substring( 0, start ) + before + selectedText + after + markdown.substring( end );

        onChange( newText );

        // Set cursor position after the operation
        setTimeout( () => {
            textarea.focus();
            textarea.setSelectionRange( start + before.length, end + before.length );
        }, 0 );
    };

    const handleToolbarAction = ( action ) => {
        switch ( action ) {
            case "bold":
                insertText( "**", "**" );
                break;
            case "italic":
                insertText( "*", "*" );
                break;
            case "h1":
                insertText( "# " );
                break;
            case "h2":
                insertText( "## " );
                break;
            case "h3":
                insertText( "### " );
                break;
            case "ul":
                insertText( "- " );
                break;
            case "ol":
                insertText( "1. " );
                break;
            case "link":
                insertText( "[", "](url)" );
                break;
            case "image":
                insertText( "![alt text](", ")" );
                break;
            case "code":
                insertText( "```" + codeLanguage + "\n", "\n```" );
                break;
            case "quote":
                insertText( "> " );
                break;
            default:
                break;
        }
    };

    const handleLanguageChange = ( e ) => {
        setCodeLanguage( e.target.value );
    };

    return (
        <div className="border rounded-lg overflow-hidden bg-white dark:bg-gray-800 shadow-sm">
            <div className="flex flex-wrap gap-1 p-2 border-b bg-gray-50 dark:bg-gray-700">
                <ToolbarButton icon={ <Bold size={ 18 } /> } onClick={ () => handleToolbarAction( "bold" ) } tooltip="Bold" />
                <ToolbarButton icon={ <Italic size={ 18 } /> } onClick={ () => handleToolbarAction( "italic" ) } tooltip="Italic" />
                <ToolbarButton icon={ <Heading1 size={ 18 } /> } onClick={ () => handleToolbarAction( "h1" ) } tooltip="Heading 1" />
                <ToolbarButton icon={ <Heading2 size={ 18 } /> } onClick={ () => handleToolbarAction( "h2" ) } tooltip="Heading 2" />
                <ToolbarButton icon={ <Heading3 size={ 18 } /> } onClick={ () => handleToolbarAction( "h3" ) } tooltip="Heading 3" />
                <ToolbarButton icon={ <List size={ 18 } /> } onClick={ () => handleToolbarAction( "ul" ) } tooltip="Unordered List" />
                <ToolbarButton
                    icon={ <ListOrdered size={ 18 } /> }
                    onClick={ () => handleToolbarAction( "ol" ) }
                    tooltip="Ordered List"
                />
                <ToolbarButton icon={ <Link size={ 18 } /> } onClick={ () => handleToolbarAction( "link" ) } tooltip="Link" />
                <ToolbarButton icon={ <Image size={ 18 } /> } onClick={ () => handleToolbarAction( "image" ) } tooltip="Image" />
                <div className="flex items-center">
                    <ToolbarButton icon={ <Code size={ 18 } /> } onClick={ () => handleToolbarAction( "code" ) } tooltip="Code Block" />
                    <select
                        value={ codeLanguage }
                        onChange={ handleLanguageChange }
                        className="ml-1 text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded px-1 py-0.5"
                    >
                        <option value="javascript">JavaScript</option>
                        <option value="jsx">JSX</option>
                        <option value="typescript">TypeScript</option>
                        <option value="tsx">TSX</option>
                        <option value="css">CSS</option>
                        <option value="html">HTML</option>
                        <option value="python">Python</option>
                        <option value="java">Java</option>
                        <option value="c">C</option>
                        <option value="cpp">C++</option>
                        <option value="csharp">C#</option>
                        <option value="php">PHP</option>
                        <option value="ruby">Ruby</option>
                        <option value="go">Go</option>
                        <option value="rust">Rust</option>
                        <option value="swift">Swift</option>
                        <option value="bash">Bash</option>
                        <option value="sql">SQL</option>
                        <option value="json">JSON</option>
                        <option value="yaml">YAML</option>
                        <option value="markdown">Markdown</option>
                    </select>
                </div>
                <ToolbarButton icon={ <Quote size={ 18 } /> } onClick={ () => handleToolbarAction( "quote" ) } tooltip="Blockquote" />
            </div>
            <textarea
                ref={ textareaRef }
                value={ markdown }
                onChange={ ( e ) => onChange( e.target.value ) }
                className="w-full h-[500px] p-4 font-mono text-sm focus:outline-none resize-none dark:bg-gray-800 dark:text-gray-100"
                placeholder="Type your markdown here..."
            />
        </div>
    );
}

function ToolbarButton ( { icon, onClick, tooltip } ) {
    return (
        <button
            type="button"
            onClick={ onClick }
            className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            title={ tooltip }
        >
            { icon }
        </button>
    );
}


// import { useState } from "react";
// import MarkdownEditor from "@/components/markdown-editor";
// import MarkdownPreview from "@/components/markdown-preview";

// export default function Home () {
//     const [ markdown, setMarkdown ] = useState( `# Markdown Editor with Syntax Highlighting

// Start typing to see the preview...

// ## Code Example

// \`\`\`jsx
// "use client";

// import Image from "next/image";
// import { BadgeCheck, DollarSign, Clock } from 'lucide-react';

// const CourseCard = ({ course }) => {
//   return (
//     <div className="max-w-3xl mx-auto bg-white shadow-lg rounded-2xl overflow-hidden border border-gray-200 hover:shadow-2xl transition duration-300">
//       {/* Course Poster */}
//       <div className="relative">
//         <Image
//           src={course.posterURL || "/placeholder.svg"}
//           alt={course.courseTitle}
//           width={800}
//           height={400}
//           className="w-full h-64 object-cover"
//         />
//         <span className="absolute top-3 left-3 bg-purple-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
//           {course.level}
//         </span>
//       </div>

//       {/* Course Details */}
//       <div className="p-6">
//         <h2 className="text-2xl font-bold text-gray-900">{course.courseTitle}</h2>
//         <p className="text-gray-600 mt-2">{course.shortDescription}</p>

//         {/* Instructor Info */}
//         <div className="flex items-center gap-3 mt-4">
//           <Image
//             src={course.instructurePhotoURL || "/placeholder.svg"}
//             alt={course.instructureName}
//             width={40}
//             height={40}
//             className="w-10 h-10 rounded-full border border-gray-300"
//           />
//           <p className="text-gray-700 font-medium">{course.instructureName}</p>
//         </div>

//         {/* Course Metadata */}
//         <div className="flex flex-wrap justify-between items-center mt-5">
//           <div className="flex items-center gap-2 text-gray-600">
//             <Clock size={20} className="text-purple-500" />
//             <span className="text-sm">{new Date(course.createdAt.seconds * 1000).toLocaleDateString()}</span>
//           </div>
//           <div className="flex items-center gap-2 text-gray-600">
//             <BadgeCheck size={20} className="text-purple-500" />
//             <span className="text-sm">{course.category}</span>
//           </div>
//           <div className="flex items-center gap-2 text-gray-600">
//             <DollarSign size={20} className="text-purple-500" />
//             <span className="text-sm font-semibold">\${course.coursePrice}</span>
//           </div>
//         </div>

//         {/* Action Buttons */}
//         <div className="mt-6 flex gap-3">
//           <button className="flex-1 bg-purple-500 hover:bg-purple-400 text-white font-semibold py-2 rounded-lg transition">
//             Enroll Now
//           </button>
//           <button className="flex-1 border border-purple-500 text-purple-500 hover:bg-purple-500 hover:text-white py-2 rounded-lg transition">
//             View Details
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default CourseCard;
// \`\`\`

// ## Python Example

// \`\`\`python
// def fibonacci(n):
//     """Generate the Fibonacci sequence up to n"""
//     a, b = 0, 1
//     while a < n:
//         yield a
//         a, b = b, a + b

// # Print the Fibonacci sequence up to 1000
// for num in fibonacci(1000):
//     print(num)
// \`\`\`
// `);
//     const [ activeTab, setActiveTab ] = useState( "edit" ); // 'edit' or 'preview'

//     const handleMarkdownChange = ( newMarkdown ) => {
//         setMarkdown( newMarkdown );
//     };

//     return (
//         <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
//             <div className="container mx-auto p-4">
//                 <h1 className="text-3xl font-bold mb-6 text-gray-800 dark:text-gray-100">Markdown Editor</h1>

//                 {/* Tabs for mobile view */ }
//                 <div className="flex mb-4 border-b border-gray-200 md:hidden">
//                     <button
//                         className={ `px-4 py-2 ${ activeTab === "edit" ? "border-b-2 border-blue-500 text-blue-600" : "text-gray-600 dark:text-gray-300" }` }
//                         onClick={ () => setActiveTab( "edit" ) }
//                     >
//                         Edit
//                     </button>
//                     <button
//                         className={ `px-4 py-2 ${ activeTab === "preview" ? "border-b-2 border-blue-500 text-blue-600" : "text-gray-600 dark:text-gray-300" }` }
//                         onClick={ () => setActiveTab( "preview" ) }
//                     >
//                         Preview
//                     </button>
//                 </div>

//                 <div className="flex flex-col md:flex-row gap-4">
//                     {/* Editor */ }
//                     <div className={ `w-full md:w-1/2 ${ activeTab === "edit" ? "block" : "hidden md:block" }` }>
//                         <MarkdownEditor markdown={ markdown } onChange={ handleMarkdownChange } />
//                     </div>

//                     {/* Preview */ }
//                     <div className={ `w-full md:w-1/2 ${ activeTab === "preview" ? "block" : "hidden md:block" }` }>
//                         <MarkdownPreview markdown={ markdown } />
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// }

