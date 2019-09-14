import React, { Component } from "react";
import { connect } from "react-redux";
import styled from "styled-components";
import "antd/dist/antd.css";
import { Form, Input, Button, message } from "antd";
import { changePassword } from "../actions/authActions";

const Wrapper = styled.div`
  width: 100%;
  padding: 30px;
`;

export class PasswordSettings extends Component {
  constructor(props) {
    super(props);

    this.state = {
      current_password: "",
      new_password: "",
      loading: false,
      submitted: false
    };
  }

  compareToFirstPassword = (rule, value, callback) => {
    const { form } = this.props;
    if (value && value !== form.getFieldValue("new_password")) {
      callback("Make sure your passwords are the same");
    } else {
      callback();
    }
  };

  validateToNextPassword = (rule, value, callback) => {
    const { form } = this.props;
    if (value) {
      form.validateFields(["confirm"], { force: true });
    }
    callback();
  };

  handleSubmit = e => {
    const { current_password, new_password } = this.state;
    e.preventDefault();
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        this.setState({ loading: true });
        Promise.all([
          this.props.changePassword({ current_password, new_password })
        ])
        .then(() => {
          this.setState({ loading: false });
          this.props.form.resetFields();
          message.success("Password Changed");
        })
        .catch((err) => {
          this.setState({ loading: false });
          message.error(err.message || "There was a problem changing your password");
        });
      }
    });
  };

  handleChange = e => {
    this.setState({
      [e.target.id]: e.target.value
    });
  };

  render() {
    const { getFieldDecorator } = this.props.form;
    const formItemLayout = {
      labelCol: {
        xs: { span: 10 },
        sm: { span: 8 }
      },
      wrapperCol: {
        xs: { span: 10 },
        sm: { span: 8 }
      }
    };
    return (
      <Wrapper>
        <h3>Change Password</h3>

        <Form {...formItemLayout} onSubmit={this.handleSubmit}>
          <Form.Item label="Current password">
            {getFieldDecorator("current_password", {
              rules: [
                {
                  required: true,
                  message: "Please input your password!"
                }
              ]
            })(<Input.Password onChange={this.handleChange} />)}
          </Form.Item>
          <Form.Item label="New password" hasFeedback>
            {getFieldDecorator("new_password", {
              rules: [
                {
                  required: true,
                  message: "Please input your password!"
                },
                {
                  validator: this.validateToNextPassword
                }
              ]
            })(<Input.Password onChange={this.handleChange} />)}
          </Form.Item>
          <Form.Item label="Confirm password" hasFeedback>
            {getFieldDecorator("confirm", {
              rules: [
                {
                  required: true,
                  message: "Please confirm your password!"
                },
                {
                  validator: this.compareToFirstPassword
                }
              ]
            })(<Input.Password onChange={this.handleChange} />)}
          </Form.Item>
          <Form.Item wrapperCol={{ span: 6, offset: 8 }}>
            <Button
              type="primary"
              htmlType="submit"
              block
              size="large"
              loading={this.state.loading}
            >
              Update Password
            </Button>
          </Form.Item>
          {this.props.auth.submitted && !this.props.auth.error && (
            <div>Success</div>
          )}
          {this.props.auth.submitted && this.props.auth.error && (
            <div>Error</div>
          )}
        </Form>
      </Wrapper>
    );
  }
}

const mapStateToProps = state => {
  return {
    auth: state.auth
  };
};

const mapDispatchToProps = dispatch => {
  return {
    changePassword: passwordForm => dispatch(changePassword(passwordForm)),
    dispatch
  };
};
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Form.create()(PasswordSettings));
