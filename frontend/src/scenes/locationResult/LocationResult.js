import {
  Col,
  Row,
  Container,
  Spinner,
  Form,
  Alert,
  NavDropdown,
  Table,
  Button,
} from "react-bootstrap";
import React, { Component, useEffect, useState } from "react";
import { withTranslation } from "react-i18next";
import { connect } from "react-redux";
import { compose } from "redux";
import { authActions } from "../../state/ducks/auth";
import { userActions } from "../../state/ducks/user";
import Swal from "sweetalert2";
import { ActionButton, ScreenNav } from "../../components";
import "./styles.scss";
import { DownloadIcon } from "../../resources/icons";

class LocationResult extends Component {
  constructor(props) {
    super(props);
    this.state = {
      users: [],
      userEditing: {},
      mainData: {
        codeECO: "",
        companyName: "",
      },
      accountId: null,
      showForm: false,
      toDeactivate: [],
      toRecovery: [],
      waitingResponse: false,
      showFilter: false,
      loading: true,
      mainDataBackup: {},
      caracter: ",(coma)",
      format: "CSV",
    };
    this.handleEdit = this.handleEdit.bind(this);
    this.handleCancelEdit = this.handleCancelEdit.bind(this);
    this.onChange = this.onChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleSubmitEdit = this.handleSubmitEdit.bind(this);
    this.onChangeRecovery = this.onChangeRecovery.bind(this);
    this.onChangeDeactivate = this.onChangeDeactivate.bind(this);
    this.handleFilter = this.handleFilter.bind(this);
  }

  componentDidMount() {
    this.getList();
  }

  getList() {
    //this.setState({ loading: true });

    // if user is root means that it comes from /account-modification and sent an account by params
    //get users using id passed by state params
    const {
      auth: {
        userData: { roles, account },
      },
      location,
      fetchUsers,
      getUsers,
      user,
    } = this.props;
    const isRoot = roles === "ADMINISTRADOR";

    const acc = location.state || account;
    const callback = (data) => {
      this.setState({ loading: false });
      if (data.success) {
        this.setState({
          accountId: acc.id,
          users: data.data.filter((user) => user.isActive),
          accountEditing: data.data[0].account,
          mainData: {
            codeECO: data.data[0].account.codeECO,
            companyName: data.data[0].account.companyName,
          },
        });
      } else {
        Swal.fire("Ha ocurrido un error", data.message, "error");
      }
    };

    if (isRoot) {
      //fetchUsers get users by id. The only one who can do it is an admin root
      fetchUsers({ callback, id: acc.id });
    } else {
      getUsers({ callback });
    }
  }

  handleEdit() {
    // make a backup before edit to recover data in case user cancel the modification
    this.setState({
      showForm: !this.state.showForm,
      mainDataBackup: this.state.mainData,
    });
  }

  handleCancelEdit() {
    this.setState({ showForm: false });
    this.setState({
      mainData: this.state.mainDataBackup,
    });
  }

  onChange(e) {
    const name = e.target.name;
    const value = e.target.value;

    this.setState({ mainData: { ...this.state.mainData, [name]: value } });
  }

  handleSubmitEdit(e) {
    const { t } = this.props;
    e.preventDefault();

    Swal.fire({
      title: t("questionPreSave"),
      confirmButtonText: t("modalButtons.accept"),
      denyButtonText: t("modalButtons.cancel"),
      showDenyButton: true,
    }).then((result) => {
      if (result.isConfirmed) {
        this.props.updateAccount({
          data: {
            companyName: this.state.mainData.companyName,
            codeECO: this.state.mainData.codeECO,
            id: this.state.accountEditing.id,
          },
          callback: ({ success, message }) => {
            this.setState({ showForm: false });
            if (success) {
              Swal.fire(message, "", "success");
            } else {
              Swal.fire(message, "", "error");
            }
          },
        });
      }
    });
  }

  handleSubmit(e) {
    e.preventDefault();
    const { toDeactivate, toRecovery } = this.state;
    const { deactivateUsers, recoveryUsers, history, t } = this.props;
    Swal.fire({
      title: t("questionPreSave"),
      html:
        toDeactivate.length > 0
          ? `<p> ${t(
              "accountModificationScreen.tableDeactivateAlertMessage"
            )} </p>`
          : "",
      showDenyButton: true,
      confirmButtonText: t("modalButtons.accept"),
      denyButtonText: t("modalButtons.cancel"),
      icon: "info",
    }).then((result) => {
      if (result.isConfirmed) {
        this.setState({ waitingResponse: true });

        const goDeactivate = () => {
          if (toDeactivate.length > 0) {
            deactivateUsers({
              data: toDeactivate,
              isActive: false,
              callback: ({ success, data }) => {
                this.setState({ waitingResponse: false });
                if (success) {
                  Swal.fire({
                    title: t("userDeactivate"),
                    icon: "success",
                    confirmButtonText: t("modalButtons.close"),
                  }).then(() => history.go(0));
                  // this.setState({
                  //   ...this.state,
                  //   users: this.state.users.filter(
                  //     (u) => !data.some((d) => d.id === u.id)
                  //   ),
                  //   toDeactivate: [],
                  // });
                } else {
                  Swal.fire(
                    "No se ha podido completar la operación",
                    "",
                    "error"
                  );
                }
              },
            });
          }
        };

        if (toRecovery.length > 0) {
          recoveryUsers({
            data: { ids: toRecovery },
            callback: ({ success }) => {
              this.setState({ waitingResponse: false });
              Swal.fire({
                title: success ? t("succesPassReset") : "error",
                confirmButtonText: t("modalButtons.accept"),
                icon: success ? "success" : "error",
              }).then(() => {
                goDeactivate();
                setTimeout(() => {
                  history.go(0);
                }, 1000);
              });
              // if (success) {
              //   this.setState({ toRecovery: [] });
              // }
            },
          });
        } else {
          goDeactivate();
        }
      }
    });
  }

  onChangeDeactivate(e) {
    const { toDeactivate } = this.state;
    const accountId = e.target.name;

    const existId = toDeactivate.includes(accountId);
    if (!existId) {
      this.setState({
        toDeactivate: [...toDeactivate, accountId],
      });
    } else {
      var newArr = this.state.toDeactivate.filter((id) => id !== accountId);
      this.setState({ toDeactivate: newArr });
    }
  }

  onChangeRecovery(e) {
    const { toRecovery } = this.state;
    const accountId = e.target.name;

    const existId = toRecovery.includes(accountId);

    if (!existId) {
      this.setState({
        toRecovery: [...toRecovery, accountId],
      });
    } else {
      var newArr = toRecovery.filter((ecoCode) => ecoCode !== accountId);
      this.setState({ toRecovery: newArr });
    }
  }

  handleFilter(newList) {
    this.setState({ users: newList });
  }

  render() {
    const { companyName, codeECO } = this.state.mainData;
    const {
      auth: {
        userData: { roles },
      },
      history,
      t,
    } = this.props;

    const { loading, showForm, showFilter, users, toDeactivate, accountId } =
      this.state;

    const isRoot = roles === "ADMINISTRADOR";
    return (
      <>
        <Container fluid className="pl-5 pr-5 user-modification-screen">
          <Row>
            <Col className="text-left mt-5 mb-3">
              {isRoot ? (
                <h1 style={{ textTransform: "uppercase" }}>
                  {" "}
                  {t("accountModificationScreen.mainTitle")}{" "}
                </h1>
              ) : (
                <h2>{t("titles.userAdministration").toUpperCase()}</h2>
              )}
            </Col>
          </Row>
          <Row>
            <Col>
              <ScreenNav
                history={history}
                previousPage={t("accounts")}
                previousUrlPage="/format-modification"
                currentPage={t("locationAdministration")}
              />
            </Col>
          </Row>
          <h5 className="mt-5">ADMINISTRADOR DE FORMATO LOCALIDADES</h5>
          <div className="d-flex justify-content-center mt-5">
            <Row className="mb-2">
              <Col>
                <p className="greenCircle">10</p>
              </Col>
              <Col className="d-flex justify-content-center align-items-center">
                <p className="textResult">Localidades Cargadas</p>
              </Col>
              <Col>
                <p className="redCircle">2</p>
              </Col>
              <Col className="d-flex justify-content-center align-items-center">
                <p className="textResult">Localidades Con Error</p>
              </Col>
              <Col className="mt-2">
                <DownloadIcon />
              </Col>
              <Col className="d-flex justify-content-center align-items-center">
                <p className="textResult">Ver detalle de errores (log.txt)</p>
              </Col>
            </Row>
          </div>
          <div className="btnConfirmar">
            <ActionButton
              onClick={() => {
                history.push({
                  pathname: "/account-modification",
                });
              }}
            >
              Confirmar
            </ActionButton>
          </div>
        </Container>
      </>
    );
  }
}
const mapDispatchToProps = ({ auth, user }) => ({ auth, user });
export default compose(
  connect(mapDispatchToProps, { ...authActions, ...userActions }),
  withTranslation()
)(LocationResult);
