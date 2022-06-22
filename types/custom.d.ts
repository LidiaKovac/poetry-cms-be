// import mongoose from "mongoose"
class ReqWithQuery extends express.Request {
    query: APIQuery
}

class APIQuery extends ParsedQs {
    sort: string
    title: string
    source: string
    tags: string
    page: string
    size: string
}



class IPoem {
    _id?: import("mongoose").Types.ObjectId
    author: string
    title: string
    text: string
    source: string
    year: number
    tags: Array<import("mongoose").Types.ObjectId>
}

class ITag {
    _id: import("mongoose").Types.ObjectId
    word: string
    color: string
    overallOccurences: number
    yearlyOccurences: Array<{ year: string, occurences: number }>
}

class IResult {
    [key: string]: {
        occurences: number,
        color: string
    }
}


class IFile extends Express.Request.files {
    [fieldname: string]: Express.Multer.File[]
    
} 