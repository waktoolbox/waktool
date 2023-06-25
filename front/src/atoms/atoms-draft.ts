import {atom} from "recoil";
import {DraftData} from "../chore/draft.ts";


export const draftDataState = atom<DraftData>({
    key: "draftData",
    default: {} as DraftData
})