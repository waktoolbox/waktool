import {$generateHtmlFromNodes} from "@lexical/html";
import {LinkNode} from '@lexical/link';
import {ListItemNode, ListNode} from '@lexical/list';
import {LinkPlugin} from "@lexical/react/LexicalLinkPlugin";
import {LexicalComposer} from "@lexical/react/LexicalComposer";
import {useLexicalComposerContext} from "@lexical/react/LexicalComposerContext";
import {useEffect, useState} from "react";
import {ListPlugin} from "@lexical/react/LexicalListPlugin";

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
    }, [jsonText])

    return (
        <div dangerouslySetInnerHTML={{__html: htmlString}}/>
    )
}

export default function WaktoolRichText(props: WaktoolRichTextProps) {
    const {namespace, jsonText} = props;
    return (
        <LexicalComposer
            initialConfig={{
                namespace: namespace,
                onError: (error) => console.error(error),
                nodes: [
                    LinkNode,
                    ListNode,
                    ListItemNode
                ]
            }}>
            <LinkPlugin/>
            <ListPlugin/>
            <TextParser namespace={namespace} jsonText={jsonText}/>
        </LexicalComposer>
    )
}