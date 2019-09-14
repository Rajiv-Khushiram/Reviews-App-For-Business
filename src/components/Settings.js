import React, { Component } from "react";
import { connect } from "react-redux";
import { Layout, Menu, Icon, Tree } from "antd";

import { getAccount } from "../actions/accountActions";
import { getBusiness } from "../actions/businessActions";

import MessageSettings from './MessageSetttings'
import PasswordSettings from './PasswordSettings'

const { Content, Sider } = Layout;
const { TreeNode } = Tree;

const DEFAULT_SECTION = "password";

export class Settings extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currentSection: DEFAULT_SECTION
    };
  }
  componentDidMount() {
    Promise.all([this.props.getAccount()]).then(() => {
      this.props.getBusiness();
    });
  }
  handleChangeSection(section) {
    this.setState({
      currentSection: section || DEFAULT_SECTION
    });
  }
  render() {
    const { account, business } = this.props;
    return (
      <Layout style={{ minHeight: "calc(100vh - 40px)" }}>
        <Content style={{ padding: "50px" }}>
          {/* <Breadcrumb style={{ margin: "16px 0" }}>
            <Breadcrumb.Item>Home</Breadcrumb.Item>
            <Breadcrumb.Item>List</Breadcrumb.Item>
            <Breadcrumb.Item>App</Breadcrumb.Item>
          </Breadcrumb> */}
          <Layout style={{ padding: "24px 0", background: "#fff" }}>
            <Sider width={200} style={{ background: "#fff" }}>
              <Menu
                mode="inline"
                defaultSelectedKeys={["1"]}
                defaultOpenKeys={["sub1", "sub2"]}
                style={{ height: "100%" }}
                onClick={(item) => this.handleChangeSection(item.key)}
              >
                <Menu.Item key="details">
                  <Icon type="user" />
                  Details
                </Menu.Item>
                {/* <Menu.Item key="messages">
                  <Icon type="notification" />
                  Messages
                </Menu.Item> */}
                <Menu.Item key="password">
                  <Icon type="lock" />
                  Change Password
                </Menu.Item>
              </Menu>
            </Sider>
            {
              this.state.currentSection === 'messages' &&
                <MessageSettings/>
            }
            {
              this.state.currentSection === 'password' &&
                <PasswordSettings/>
            }
            {
              this.state.currentSection === 'details' &&
              <Content style={{ padding: "0 24px", minHeight: 280 }}>
                <h3>Your Account</h3>
                <table cellpadding="10">
                  <tbody>
                    <tr>
                      <td>Name</td>
                      <td>
                        <strong>{account.name}</strong>
                      </td>
                    </tr>
                    <tr>
                      <td>Email</td>
                      <td>
                        <strong>{account.email}</strong>
                      </td>
                    </tr>
                  </tbody>
                </table>
                <hr />
                <h3>{business.name}</h3>
                <table cellpadding="10">
                  <tbody>
                    <tr>
                      <td>Review Link</td>
                      <td>
                        <strong>
                          <a
                            href={business.review_url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {business.review_url}
                          </a>
                        </strong>
                      </td>
                    </tr>
                    <tr>
                      <td>Products</td>
                      <td>
                        <Tree showLine defaultExpandAll={true} showIcon={true}>
                          {business.products &&
                            Object.keys(business.products).map((key, idx) => {
                              const makes = business.products[key];
                              return (
                                <TreeNode
                                  title={key}
                                  key={`${idx}-0`}
                                  defaultExpandAll={true}
                                >
                                  {makes.map((make, makeIdx) => {
                                    return (
                                      <TreeNode
                                        title={make}
                                        key={`${idx}-${makeIdx}`}
                                        icon={null}
                                      />
                                    );
                                  })}
                                </TreeNode>
                              );
                            })}
                        </Tree>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </Content>
            }
          </Layout>
        </Content>
      </Layout>
    );
  }
}

const mapStateToProps = state => ({
  business: state.business,
  account: state.account
});

const mapDispatchToProps = dispatch => {
  return {
    getBusiness: () => dispatch(getBusiness()),
    getAccount: () => dispatch(getAccount())
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Settings);
