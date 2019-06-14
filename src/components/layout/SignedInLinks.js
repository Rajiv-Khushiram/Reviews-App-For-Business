import React from 'react';
import { connect } from 'react-redux';
import { signOut } from '../../actions/authActions';


const SignedInLinks = (props) => {
    return (
        <ul>
            <li><a href="/signin" onClick={props.signOut}>Log Out</a></li>
        </ul>
    )
}

const mapDispatchToProps = (dispatch) => {
    return {
        signOut: () => dispatch(signOut())
    }
}

export default connect(null, mapDispatchToProps)(SignedInLinks);