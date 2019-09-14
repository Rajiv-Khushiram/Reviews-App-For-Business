import React, { Component } from "react";
import { getAccount } from "../actions/accountActions";
import { getBusiness } from "../actions/businessActions";
import { getPhoto } from "../actions/photoActions";
import { connect } from "react-redux";
import { Card } from "antd";
import StackGrid from "react-stack-grid";

import Loading from './Loading'

class Widget extends Component {
  state = {
    uid: this.props.auth.uid,
    photoList: [],
    commentList: []
  };

  componentDidMount() {
    Promise.all([
      this.props.getAccount()
    ]).then(() => {
      this.props.getBusiness()
    }).then(() => {
    this.props.getPhoto();
    });
  }

  componentDidUpdate(prevProps) {
    if (this.props.photoList !== prevProps.photoList) {
      setTimeout(() => {
        this.setState({
          photoList: this.props.photoList,
          commentList: this.props.commentList
        });
      }, 2000);
      // setTimeout(() => {
      //   this.grid.updateLayout();
      // }, 3000);
    }
  }

  render() {
    const { photoList } = this.props;
    
    if(photoList.length < 1) {
      return <Loading />
    }

    return (
      <StackGrid
        columnWidth={150}
        gutterHeight={20}
        gridRef={grid => (this.grid = grid)}
      >
        {photoList.map((img, index) => (
          <div key={img.picture_url.toString()}>
            <Card
              cover={<img src={img.picture_url} alt="" />}
              style={{ marginTop: "auto" }}
            />
          </div>
        ))}
      </StackGrid>
    );
  }
}

const mapStateToProps = state => {
  return {
    auth: state.firebase.auth,
    photoList: state.photo.photoList,
    commentList: state.photo.commentList
  };
};

const mapDispatchToProps = dispatch => {
  return {
    getBusiness: () => dispatch(getBusiness()),
    getAccount: () => dispatch(getAccount()),
    getPhoto: () => dispatch(getPhoto()),
    dispatch
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Widget);
