import React, { Component } from 'react';
import { connect } from 'react-redux';
import { signIn } from '../../actions/authActions';
import { Redirect } from 'react-router-dom';
import { Form, Icon, Input, Button, message } from 'antd';

class SignIn extends Component {
    state = {
        email:'',
        password:''
    }

    handleChange = (e) => {
        this.setState({
            [e.target.id]:e.target.value
        })
    }

    handleSubmit = (e) => {
        e.preventDefault();
        this.props.form.validateFieldsAndScroll((err, values) => {
            if (!err) {
                console.log('Received values of form: ', values);            
                this.props.signIn(this.state);
                message.info('Logging', 1.5);
                setTimeout(() => {
                    if (this.props.auth.uid == null){
                        message.warning('Invalid email or password');
                    } else {
                        message.success('Login success');
                    } 
                },  2500);                                         
            }
        });         
    }

    render() {
        const { getFieldDecorator } = this.props.form;
        const { auth } = this.props;
        if(auth.uid) return <Redirect to='/'/>

        return (
            <div className = "login-container">
                <h1> Use on Mobile device for intended experience </h1>
                <Form onSubmit={this.handleSubmit}>
                    <Form.Item>Sign In</Form.Item>
                    <Form.Item>
                        {getFieldDecorator('email', {
                            rules: [{ required: true, message: 'Please input your Email!' }],
                        })(
                            <Input prefix={<Icon type="mail" style={{ width: '50%' }}/>} onChange={this.handleChange} placeholder="test@gmail.com"/>
                        )}
                    </Form.Item>
                    <Form.Item>
                        {getFieldDecorator('password', {
                            rules: [{ required: true, message: 'Please input your Password!' }],                       
                        })(
                            <Input prefix={<Icon type="lock" style={{ width: '50%' }}/>} onChange={this.handleChange} type="password" placeholder="test123"/>
                        )}
                    </Form.Item>
                    <Form.Item>
                        <Button type="primary" htmlType="submit" className="login-form-button">
                            Login
                        </Button>
                    </Form.Item>        
                </Form>
            </div>
        )
    }
}

const mapStateProps = (state) => {
    return {
        authError: state.auth.authError,
        auth: state.firebase.auth
    }
}

const mapDispatchToProps = (dispatch) => {
    return{
        signIn: (creds) => dispatch(signIn(creds))
    }
}

export default Form.create() (connect(mapStateProps, mapDispatchToProps)(SignIn));
