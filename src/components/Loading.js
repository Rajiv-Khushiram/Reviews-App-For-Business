import React from 'react'
import { Spin } from "antd";
import styled from 'styled-components'

const Wrapper = styled.div`
  margin: 20px 0;
  padding: 30px 50px;
  text-align: center;
`;


export default function Loading() {
  return (
    <Wrapper>
      <Spin/>
    </Wrapper>
  )
}
