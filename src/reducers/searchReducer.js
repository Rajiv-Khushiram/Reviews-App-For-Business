const initState ={
    customerList:[],
    error:null,
}

const searchReducer = (state = initState, action) =>{
    switch(action.type){
        case 'RETRIEVE_SUCCESS':
            return {
                ...state,
                customerList:action.query
            } 
        case 'RETRIEVE_ERROR':
            return {
                ...state,
                error:"Not Found"
            }
        default:
            return state; 
    }
}

export default searchReducer;