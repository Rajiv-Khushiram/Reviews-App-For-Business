import React, { Component } from "react";
import { connect } from "react-redux";
import { Button } from 'antd';
import { Redirect } from 'react-router-dom';
import { reDirectToForm } from "../actions/reviewActions";

class SuccessReviewForm extends Component {
        state = {
            first_name : this.props.location.state.first_name,
            last_name: this.props.location.state.last_name,
            phone: this.props.location.state.phone
            };

        componentDidMount() {
            console.log(this.props.location.state.first_name)
            }

        redirectToReviewForm = () => { 
            this.props.reDirectToForm();
            }   

        render() {
            if(!this.props.review.submitted) return <Redirect to='/review-form'/>
            return ( 
                <div className="container">
                <br></br><br></br>
                <center><h1>CUSTOMER SAVED</h1></center> 
                <br></br> <br></br> <br></br>
                <center> <h3> {this.state.first_name}  {this.state.last_name} <br></br> </h3><h3> {this.state.phone}  </h3>
                <br></br> <br></br> <br></br>
                    <Button type="primary" onClick={this.redirectToReviewForm} icon="camera" size="large">
                        Add another Customer
                        </Button></center>
                </div>
            )
        }
    }

    const mapStateToProps = (state) => {
        return {
            auth: state.firebase.auth,
            review: state.review
        }       
    }

    const mapDispatchToProps = dispatch => {
        return {
            reDirectToForm: () => dispatch(reDirectToForm()),
            dispatch
        }
    }

    export default connect(
    mapStateToProps,
    mapDispatchToProps
    )(SuccessReviewForm)
