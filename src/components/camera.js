import React, { Component } from 'react'
import Camera, { FACING_MODES } from 'react-html5-camera-photo'
import 'react-html5-camera-photo/build/css/index.css'
import { ontakePhoto } from '../actions/reviewActions'
import { connect } from 'react-redux'

class html5Camera extends Component {
  constructor (props) {
    super(props)
    this.state = { }
  }

  onTakePhoto (dataUri) {
    Promise.all([
      this.setState({
        pictureUri: dataUri
      })
    ])
      .then(() => {
        this.props.ontakePhoto(this.state)
      })
  }

  render () {
    return (
      <Camera
        onTakePhoto={(dataUri) => { this.onTakePhoto(dataUri) }}
        idealFacingMode={FACING_MODES.ENVIRONMENT}
        idealResolution={{height: 1334}}
        imageCompression={0.5}
        isMaxResolution={false}
        isImageMirror={false}
        isSilentMode={true}
        isDisplayStartCameraError={true}
        // isFullscreen={true}
        // sizeFactor={0.6}
      />
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
    ontakePhoto: review => dispatch(ontakePhoto(review)),
    dispatch
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(html5Camera)
