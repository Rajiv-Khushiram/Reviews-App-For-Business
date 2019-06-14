const initState = {
    photoList:[],
    commentList:[]
}

const photoReducer = (state = initState, action) => {
    switch(action.type) {
        case 'LIST_PHOTO_SUCCESS':
            return {
                ...state,
                photoList:action.query,
                commentList:action.comments
            } 
        case 'LIST_PHOTO_ERR':
            return {
                ...state,
                error:action.err,          
            }  
        default:
            return state;
    }
 }
 
 export default photoReducer;