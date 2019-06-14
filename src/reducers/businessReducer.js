const initState = {};

const businessReducer = (state = initState, action) => {
  switch (action.type) {
    case "GET_BUSINESS": {
      return {
        loading: true
      };
    }
    case "GET_BUSINESS_SUCCESS": {
      return {
        ...action.data
      };
    }
    case "GET_BUSINESS_FAILURE": {
      return {
        loading: false,
        error: "Couldn't get business details."
      };
    }
    default: {
      return state
    }
  }
};

export default businessReducer;
