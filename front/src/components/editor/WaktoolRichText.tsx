import {$generateHtmlFromNodes} from "@lexical/html";
import {LinkNode} from '@lexical/link';
import {LinkPlugin} from "@lexical/react/LexicalLinkPlugin";
import {LexicalComposer} from "@lexical/react/LexicalComposer";
import {useLexicalComposerContext} from "@lexical/react/LexicalComposerContext";
import {useEffect, useState} from "react";

type WaktoolRichTextProps = {
    namespace: string
    jsonText: any
}

function TextParser(props: WaktoolRichTextProps) {
    const {jsonText} = props;
    const [editor] = useLexicalComposerContext();
    const [htmlString, setHtmlString] = useState("")

    useEffect(() => {
        try {
            const editorState = editor.parseEditorState(jsonText);
            editor.setEditorState(editorState);
            editor.update(() => {
                setHtmlString($generateHtmlFromNodes(editor, null));
            }, {})
        } catch (e) {
            console.debug(e)
        }
    }, [])

    return (
        <div dangerouslySetInnerHTML={{__html: htmlString}}/>
    )
}

export default function WaktoolRichText(props: WaktoolRichTextProps) {
    const {namespace, jsonText} = props;
    return (
        <LexicalComposer
            initialConfig={{namespace: namespace, onError: (error) => console.error(error), nodes: [LinkNode]}}>
            <LinkPlugin/>
            <TextParser namespace={namespace} jsonText={jsonText}/>
        </LexicalComposer>
    )
}