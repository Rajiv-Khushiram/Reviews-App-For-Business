import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { Icon } from "antd";
import styled from "styled-components";

const Wrapper = styled.div`
  width: 100%;
  padding: 30px;
`;

const Message = styled.div`
  align-items: center;
  background: #fff;
  box-shadow: 0 5px 12px rgba(0, 0, 0, 0.04);
  border: solid 1px #e8e8e8;
  border-radius: 4px;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  margin: 30px 0;
  padding: 16px;
  position: relative;
  width: 100%;

  /* &:hover {
    &:before {
      background: rgba(255, 255, 255, 0.65);
      content: "";
      position: absolute;
      left: 0;
      top: 0;
      width: 100%;
      height: 100%;
    }
  } */

  &:after {
    content: " ";
    background: #ccc;
    height: 10px;
    left: 30px;
    position: absolute;
    top: calc(100% + 10px);
    width: 1px;
  }

  &:last-child {
    &:after {
      display: none;
    }
  }
`;

const Order = styled.div`
  align-items: center;
  background: #fff;
  border-radius: 30px;
  border: solid 3px #fff;
  color: #333;
  display: flex;
  font-size: 18px;
  height: 25px;
  justify-content: center;
  margin: 0 24px 0 0;
  width: 25px;
`;

const MessagePreview = styled.div`
  margin-right: auto;
`;

const MessageInput = styled.textarea`
  margin-right: auto;
  display: block;
  width: 100%;
`

const Delay = styled.div`
  font-size: 0.8em;
  color: #888;
`;

export class MessageSetttings extends Component {
  constructor(props) {
    super(props);

    this.state = {
      editing: null,
      messages: [
        {
          order: 0,
          text:
            "Thanks so much for choosing us! We are thrilled to have been able to serve you today."
        },
        {
          order: 1,
          text: "Here is your photo"
        }
      ]
    };
  }
  static propTypes = {
    prop: PropTypes
  };

  enterMessageEditMode(id) {
    this.setState({
      editing: id
    });
  }

  exitMessageEditMode() {
    this.setState({
      editing: null
    });
  }

  render() {
    return (
      <Wrapper>
        <h3>Messages</h3>
        <h5>
          These messages will send, in order to each new customer you add.
        </h5>
        {this.state.messages.map((message, index) => {
          return (
            <Message>
              <Order>{index + 1}</Order>
              {this.state.editing === index && (
                <div>
                  <MessageInput autofocus>{message.text}</MessageInput>
                  <a href="#top" onClick={() => this.exitMessageEditMode(index)}>Done</a>
                </div>
              )}
              {this.state.editing !== index && (
                <MessagePreview>{message.text} <a href="#top" onClick={() => this.enterMessageEditMode(index)}>Edit</a></MessagePreview>
              )}
              <Delay>
                <Icon type="clock-circle" /> Immediately
              </Delay>
            </Message>
          );
        })}
      </Wrapper>
    );
  }
}

const mapStateToProps = state => ({});

const mapDispatchToProps = {};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(MessageSetttings);
