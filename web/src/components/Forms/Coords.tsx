import React, { useEffect, useState, useMemo } from 'react';
import { Badge, Col, Form, Row } from 'react-bootstrap';
import { Vec3 } from 'vec3';
import { v4 as uuidv4 } from 'uuid';

type Props = {
    label?: string
    coords: Vec3 | undefined
    onChange: (vec3: Vec3 | undefined) => void
}

export const Coords: React.FC<Props> = (props) => {
    const { label, onChange, coords, } = props
    const [x, setX] = useState(coords?.x.toString() ?? '')
    const [y, setY] = useState(coords?.y.toString() ?? '')
    const [z, setZ] = useState(coords?.z.toString() ?? '')

    const uuid = useMemo(() => uuidv4(), [])

    useEffect(() => {
        const newVec3 = isNaN(parseInt(x)) || isNaN(parseInt(y)) || isNaN(parseInt(z)) ? undefined : new Vec3(parseInt(x), parseInt(y), parseInt(z))
        if (!newVec3 && !coords) return
        if (coords && newVec3 && newVec3.equals(coords)) return
        onChange(newVec3)
    }, [x, y, z, onChange])


    useEffect(() => {
        const newVec3 = isNaN(parseInt(x)) || isNaN(parseInt(y)) || isNaN(parseInt(z)) ? undefined : new Vec3(parseInt(x), parseInt(y), parseInt(z))
        if (!newVec3 && !coords) return
        if (coords && newVec3 && newVec3.equals(coords)) return
        setX(coords?.x.toString() ?? '')
        setY(coords?.y.toString() ?? '')
        setZ(coords?.z.toString() ?? '')
    }, [coords])


    return (
        <>
            {label &&
                <div className='mb-2'>
                    {label}
                </div>
            }

            <Row>
                <Form.Group controlId={`xPos_${uuid}`} as={Col} md="12" lg="4" className='d-flex d-md-block align-items-center mb-2'>
                    <Form.Label className='me-3'>
                        <Badge>X</Badge>
                    </Form.Label>
                    <Form.Control
                        type="number"
                        value={x}
                        onChange={(e) => setX(e.target.value)}
                        className={isNaN(parseInt(x)) ? 'is-invalid' : ''}
                    />
                </Form.Group>

                <Form.Group controlId={`yPos_${uuid}`} as={Col} md="12" lg="4" className='d-flex d-md-block align-items-center mb-2'>
                    <Form.Label className='me-3'>
                        <Badge bg='warning' text='dark' >Y</Badge>
                    </Form.Label>
                    <Form.Control
                        type="number"
                        value={y}
                        onChange={(e) => setY(e.target.value)}
                        className={isNaN(parseInt(y)) ? 'is-invalid' : ''}
                    />
                </Form.Group>

                <Form.Group controlId={`zPos_${uuid}`} as={Col} md="12" lg="4" className='d-flex d-md-block align-items-center mb-2'>
                    <Form.Label className='me-3'>
                        <Badge bg='danger'>Z</Badge>
                    </Form.Label>
                    <Form.Control
                        type="number"
                        value={z}
                        onChange={(e) => setZ(e.target.value)}
                        className={isNaN(parseInt(z)) ? 'is-invalid' : ''}
                    />
                </Form.Group>
            </Row>
        </>
    )
}
