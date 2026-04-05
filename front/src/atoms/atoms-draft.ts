import {atom} from "@zedux/react";
import {DraftData} from "../chore/draft.ts";


export const draftDataState = atom<DraftData | undefined>(
    "draftData",
    undefined
)