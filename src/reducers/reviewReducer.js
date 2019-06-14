const initState = {
    visible:false,
    pictureUri: "",
    error:false,
}

const reviewReducer = (state = initState, action) => {
    switch(action.type) {
        case 'CREATE_CUSTOMER':
            return {
                ...state,
                customer: action.data.id
            } 
        case 'CREATE_PURCHASE':
            console.log(action.data)
                return {...state,
                    purchase: action.data.id
                }        
        case 'CREATE_REVIEW_SUCCESS':
            return {
                ...initState,
                submitted:true,
                error:false,
                submitError:false,
            } 
        case 'CREATE_REVIEW_ERR':
            return {
                ...state,
                submitted:true,
                error:action.err,
            } 
        
        case 'CAPTURE_PHOTO':
            return {
                ...state,
                pictureUri: action.review.pictureUri,
                visible:true,
            }
        case 'CLOSE_CAMERA':
            return {
                ...state,
                visible:false,
            }  
            case 'REDIRECT_TO_FORM':
            return {
                ...initState,
                submitted:false,
            } 
        case 'RETRY_PHOTO':
            return {
                pictureUri:null,
                visible:true,
            }
            case 'REMOVE_PHOTO':
            return {
                pictureUri:null,
                visible:false
            }
            
            
        case "LAUNCH_CAMERA": {
            return {
                visible:true,
            }
            
        }        
        default:
            return state;
    }
 }
 
 export default reviewReducer;