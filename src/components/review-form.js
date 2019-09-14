import React, { Component } from "react";
import { Form, Input, Select, Icon, Button, Modal } from "antd";
// import FormItem from "antd/lib/form/FormItem";
import { connect } from "react-redux";
import styled from "styled-components";

import {
  sendReview,
  openCamera,
  closeCamera,
  retryPhoto,
  removePhoto
} from "../actions/reviewActions";
import { getAccount } from "../actions/accountActions";
import { getBusiness } from "../actions/businessActions";
import { productYear } from "../constants/productInfo";
import Camera from "./camera";

const Wrapper = styled.div`
  padding-top: 60px;

  @media (max-width: 600px) {
    padding-bottom: 70px;
  }
`;

const CameraWrapper = styled.div`
  background: #000;
  height: 100vh;
  display: flex;
  justify-content: stretch;
  align-items: center;

  .react-html5-camera-photo {
    display: flex;
    height: 75vh;
  }
`;

const PhotoActionButtons = styled.div`
  display: flex;
  flex-direction: row;
  justify-items: space-around;
  position: fixed;
  top: 50%;
  left: 0;
  width: 100%;
  transform: translateY(-50%);
  align-items: center;
  justify-content: center;
  padding: 20px;
`;

const ConfirmPhotoButton = styled.div`
  background: rgba(0, 0, 0, 0.5);
  color: #fff;
  border-radius: 5px;
  display: flex;
  flex-direction: column;
  margin: 10px;
  padding: 24px;
`;

const RejectPhotoButton = styled.div`
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  color: tomato;
  border-radius: 5px;
  margin: 10px;
  padding: 24px;
`;

class CustomerReview extends Component {
  state = {
    first_name: "",
    last_name: "",
    phone: "",
    uid: this.props.auth.uid,
    // product_year: productYear[0],
    // product_make: productMake[0],
    // model_list: productModel[productMake[0]],
    // product_model: productModel[productMake[0]][0],
    lists: {
      years: productYear,
      makes: [],
      models: []
    },
    selected: {
      make: "",
      model: "",
      year: new Date().getFullYear()
    },
    comments: "",
    loading: false,
    submitted: false
  };

  componentDidMount() {
    Promise.all([this.props.getAccount()]).then(() => {
      Promise.all([this.props.getBusiness()]).then(() => {
        this.bootstrapMakes(this.props.business.products);
      });
    });
  }

  bootstrapMakes = products => {
    const makes = Object.keys(products).reduce((a, o) => {
      a.push(o);
      return a;
    }, []);
    this.setState({
      ...this.state,
      selected: {
        ...this.state.selected,
        make: makes[0],
        model: products[makes[0]][0]
      },
      lists: {
        ...this.state.lists,
        models: products[makes[0]],
        makes
      }
    });
  };

  showCamera = () => {
    this.props.openCamera(this.state);
  };

  removePic = () => {
    this.props.removePhoto(this.state);
  };

  clearPictureUrl = () => {
    this.props.retryPhoto(this.state);
  };
  handleOk = () => {
    this.props.closeCamera(this.state);
  };

  handleCancel = () => {
    this.removePic();
    this.props.closeCamera(this.state);
  };
  handleYearChange = value => {
    this.setState({
      selected: {
        ...this.state.selected,
        year: value
      }
    });
  };
  handleProductMakeChange = value => {
    const makes = this.props.business.products;
    const models = makes[value];

    this.setState({
      selected: {
        ...this.state.selected,
        make: value
      },
      lists: {
        ...this.state.lists,
        models
      }
    });
  };

  handleModelChange = value => {
    this.setState({
      selected: {
        ...this.state.selected,
        model: value
      }
    });
  };

  checkPhoneValidation = (rule, value, callback) => {
    const re = /^04\d{8}$/;
    if (value && !re.test(value)) {
      callback("Input a valid phone number");
    } else {
      callback();
    }
  };
  openNotification() {
    alert("Details saved. The customer will receive an SMS soon.");
    // notification.open({
    //   message: 'Notification Title',
    //   description: 'Form has been successfully submitted',
    //   icon: <Icon type="check-circle" style={{ color: 'green' }} />,
    // });
  }

  handleChange = e => {
    this.setState({
      [e.target.id]: e.target.value
    });
  };

  handleSubmit = e => {
    e.preventDefault();
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        console.log("Received values of form: ", values);
        this.setState({ loading: true });
        e.target.reset();
        this.props.sendReview(this.state);
        setTimeout(() => {
          if (this.props.review.submitted && !this.props.review.error) {
            this.openNotification();
          }
          this.setState({ loading: false });
        }, 2000);
      }
    });
  };

  render() {
    const { getFieldDecorator } = this.props.form;
    const { lists } = this.state;
    const { Option } = Select;
    // const TextArea = Input.TextArea;

    return (
      <Wrapper>
        <div>
          <Modal
            visible={this.props.review.visible}
            onOk={this.handleOk}
            onCancel={this.handleCancel}
            footer={[]}
            bodyStyle={{
              padding: "0"
            }}
            style={{
              top: "0",
              left: "0"
            }}
          >
            {this.props.review.pictureUri && this.props.review.visible && (
              <div>
                <img
                  alt=""
                  src={this.props.review.pictureUri}
                  style={{
                    width: "100%",
                    display: "block"
                  }}
                />
                <PhotoActionButtons>
                  <RejectPhotoButton onClick={this.clearPictureUrl}>
                    <Icon type="camera" style={{ fontSize: "32px" }} />
                    Retake
                  </RejectPhotoButton>
                  <ConfirmPhotoButton onClick={this.handleOk}>
                    <Icon type="check-circle" style={{ fontSize: "32px" }} />
                    Continue
                  </ConfirmPhotoButton>
                </PhotoActionButtons>
              </div>
            )}
            <CameraWrapper>
              {!this.props.review.pictureUri && this.props.review.visible && (
                <Camera />
              )}
            </CameraWrapper>
          </Modal>
        </div>
        <div>
          <center>
            <Button
              type="primary"
              onClick={this.showCamera}
              icon="camera"
              size="large"
            >
              Take a Photo
            </Button>
            {this.props.review.pictureUri && (
              <Button
                type="danger"
                onClick={this.removePic}
                icon="delete"
                size="large"
              >
                Remove Photo
              </Button>
            )}
          </center>
          <br />
        </div>

        {this.props.review.pictureUri && (
          <center>
            <img alt="img" src={this.props.review.pictureUri} width="320" />
          </center>
        )}
        <div className="review-container">
          <Form onSubmit={this.handleSubmit}>
            <h3>Customer Details</h3>
            <Form.Item>
              {getFieldDecorator("first_name", {
                rules: [
                  {
                    required: true,
                    message: "Enter a first name",
                    whitespace: true
                  }
                ]
              })(
                <Input
                  id="first_name"
                  type="text"
                  onChange={this.handleChange}
                  size="large"
                  style={{ width: "100%" }}
                  placeholder="First Name"
                />
              )}
            </Form.Item>
            <Form.Item>
              {getFieldDecorator("last_name", {
                rules: [
                  {
                    required: true,
                    message: "Enter a last name",
                    whitespace: true
                  }
                ]
              })(
                <Input
                  id="last_name"
                  type="text"
                  onChange={this.handleChange}
                  size="large"
                  style={{ width: "100%" }}
                  placeholder="Last Name"
                />
              )}
            </Form.Item>
            <Form.Item>
              {getFieldDecorator("phone", {
                rules: [
                  {
                    required: true,
                    message: "Enter a phone number"
                  },
                  {
                    validator: this.checkPhoneValidation
                  }
                ]
              })(
                <Input
                  type="tel"
                  id="phone"
                  onChange={this.handleChange}
                  size="large"
                  style={{ width: "100%" }}
                  placeholder="Phone Number"
                />
              )}
            </Form.Item>
            <Form.Item />
            <h3>Purchase Details</h3>
            <Form.Item>
              <Select 
                defaultValue={lists.years[0]}
                style={{ width: "100%" }}
                value={this.state.selected.year}
                onChange={this.handleYearChange}
                size="large"
                placeholder="Year"
              >
                {productYear.map(year => (
                  <Option key={year}>{year}</Option>
                ))}
              </Select>
            </Form.Item>
            {/* <Form.Item>
              <Select
                showSearch
                placeholder="Make"
                style={{ width: "100%" }}
                key={this.state.selected.make}
                value={this.state.selected.make}
                size="large"
                onChange={this.handleProductMakeChange}
              >
                {lists.makes.map(make => {
                  return <Option key={make}>{make}</Option>;
                })}
              </Select>
            </Form.Item> */}
            <Form.Item>
              <Select
                style={{ width: "100%" }}
                value={this.state.selected.model}
                size="large"
                onChange={this.handleModelChange}
                placeholder="Model"
              >
                {lists &&
                  lists.models.map(model => (
                    <Option key={model}>{model}</Option>
                  ))}
              </Select>
            </Form.Item>
            {/* <Form.Item>
              <TextArea
                id="comments"
                rows={5}
                onChange={this.handleChange}
                style={{ width: "100%" }}
                size="large"
                placeholder="Comments"
              />
            </Form.Item> */}
            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                block
                size="large"
                loading={this.state.loading}
              >
                Submit
              </Button>
            </Form.Item>
            {this.props.review.submitted && !this.props.review.error && (
              <div>Success</div>
            )}
            {this.props.review.submitted && this.props.review.error && (
              <div>Error</div>
            )}
          </Form>
        </div>
      </Wrapper>
    );
  }
}

const mapStateToProps = state => {
  return {
    account: state.account,
    auth: state.firebase.auth,
    business: state.business,
    review: state.review
  };
};

const mapDispatchToProps = dispatch => {
  return {
    sendReview: review => dispatch(sendReview(review)),
    getBusiness: () => dispatch(getBusiness()),
    getAccount: () => dispatch(getAccount()),
    openCamera: () => dispatch(openCamera()),
    closeCamera: () => dispatch(closeCamera()),
    retryPhoto: () => dispatch(retryPhoto()),
    removePhoto: () => dispatch(removePhoto()),
    dispatch
  };
};

export default Form.create()(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(CustomerReview)
);
