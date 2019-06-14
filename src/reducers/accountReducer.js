const initState = {};

const businessReducer = (state = initState, action) => {
  switch (action.type) {
    case "GET_ACCOUNT": {
      return {
        loading: true
      };
    }
    case "GET_ACCOUNT_SUCCESS": {
      return {
        ...action.data
      };
    }
    case "GET_ACCOUNT_FAILURE": {
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
