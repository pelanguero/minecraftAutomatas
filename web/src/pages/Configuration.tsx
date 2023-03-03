import { Fragment, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import Form from 'react-bootstrap/Form'
import { Button, Col, Row } from 'react-bootstrap'
import { actionCreators, State } from '@/state'
import { bindActionCreators } from 'redux'
import axios from 'axios'
axios.defaults.withCredentials = true;

const Configuration = () => {

    const configurationState = useSelector((state: State) => state.configurationReducer);
    const {
        loged,
        connected,
        master,
        webServerSocketPassword,
        webServerSocketURL,
        webServerSocketPort,
        serverBots
    } = configurationState

    const dispatch = useDispatch();
    const {
        updateMaster,
        updateServer,
        updateServerPort,
        updateServerPassword,
        updateBotServer
    } = bindActionCreators(actionCreators, dispatch);



    const handleChangeMaster = (event: React.ChangeEvent<HTMLInputElement>) => {
        updateMaster(event.target.value)
    }

    const handleChangeWebSocketServer = (event: React.ChangeEvent<HTMLInputElement>) => {
        updateServer(event.target.value)
    }

    const handleChangeWebSocketServerPort = (event: React.ChangeEvent<HTMLInputElement>) => {
        updateServerPort(parseInt(event.target.value))
    }

    const handleChangeWebSocketServerPassword = (event: React.ChangeEvent<HTMLInputElement>) => {
        updateServerPassword(event.target.value)
    }

    const handleChangeBotServer = (event: React.ChangeEvent<HTMLInputElement>) => {
        updateBotServer(event.target.value)
    }

    // useEffect(() => {
    //     axios.get('http://localhost:5000/api/login')
    // }, [])

    // const handleLogin = () => {
    //     axios.post('http://localhost:5000/api/login', {
    //         password: 'admin'
    //     })
    // }

    // const checkLogin = () => {
    //     axios.get('http://localhost:5000/api/login')
    // }

    // const logout = () => {
    //     axios.post('http://localhost:5000/api/logout')
    // }

    return (
        <Fragment>
            <Row>
                <Col>
                    <h1>Configuration</h1>
                </Col>
            </Row>
            <Row>
                <Col>
                    <Form>

                        <Form.Group controlId="handleChangeWebSocketServerPassword">
                            <Form.Label>Web Socket Server Password</Form.Label>
                            <Form.Control type="password" value={webServerSocketPassword} onChange={handleChangeWebSocketServerPassword} />
                        </Form.Group>

                        <Form.Group controlId="handleChangeMaster">
                            <Form.Label>Master</Form.Label>
                            <Form.Control type="text" value={master} onChange={handleChangeMaster} />
                        </Form.Group>

                        <Form.Group controlId="handleChangeWebSocketServer">
                            <Form.Label>Web Socket Server URL</Form.Label>
                            <Form.Control type="text" value={webServerSocketURL} onChange={handleChangeWebSocketServer} />
                        </Form.Group>

                        <Form.Group controlId="handleChangeWebSocketServerPort">
                            <Form.Label>Web Socket Server Port</Form.Label>
                            <Form.Control type="text" value={webServerSocketPort} onChange={handleChangeWebSocketServerPort} />
                        </Form.Group>

                        <Form.Group controlId="handleChangeBotServer">
                            <Form.Label>Server Bots (Used for connect to Bots Viewers)</Form.Label>
                            <Form.Control type="text" value={serverBots} onChange={handleChangeBotServer} />
                        </Form.Group>

                        {/* <div>
                            <Button className='my-3' variant='success' onClick={handleLogin}>Login</Button>
                        </div>

                        <div>
                            <Button className='my-3' variant='success' onClick={checkLogin}>checkLogin</Button>
                        </div>
                        <div>
                            <Button className='my-3' variant='success' onClick={logout}>logout</Button>
                        </div> */}

                        <div>
                            Server status:
                            {connected ?
                                <span className='color-green'>Online</span> :
                                <span className='color-red'>Offline</span>
                            }
                        </div>
                        <div>
                            Login status:
                            {loged ?
                                <span className='color-green'>Loged!</span> :
                                <span className='color-red'>Not loged</span>
                            }
                        </div>

                    </Form>
                </Col>
            </Row>
        </Fragment>
    );

}

export default Configuration