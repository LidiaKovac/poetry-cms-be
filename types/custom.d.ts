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
    tags: Array<import("mongoose").Types.ObjectId> | Array<ITag>
}

class ITag {
    _id: import("mongoose").Types.ObjectId
    word: string
    color: string
    overallOccurences: number
    yearlyOccurences: Array<{ year: string, occurences: number }>
}

class IYear {
    _id: import("mongoose").Types.ObjectId
    year: string
    tags: Array<ITag> | Array<import("mongoose").Types.ObjectId>
    poems: Array<IPoem> | Array<import("mongoose").Types.ObjectId>
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


class YearResults {
    [fieldname: string]: Array<ITag>
}