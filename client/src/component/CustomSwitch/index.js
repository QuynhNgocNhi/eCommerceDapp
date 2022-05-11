import React, { useState } from 'react';
import { Box, Form, Input, Button, Flex, MetaMaskButton, Table, Card, Heading, Text } from "rimble-ui";





export default function CustomSwitch({
    selectionMode,
    option1,
    option2,
    onSelectSwitch,
}) {
    const [getSelectionMode, setSelectionMode] = useState(selectionMode);

    const updateSwitchData = value => {
        setSelectionMode(value);
        onSelectSwitch(value);
    };

    return (
        <div style={{



            width: '100%',
            display: 'flex',
            justifyContent: 'center',

        }}>
            <div style={{


                width: 150,
                paddingTop: 50,

                flexDirection: 'row',
                justifyContent: 'space-between',
            }}
            >



                <Card
                    onClick={() => updateSwitchData(1)}
                    style={{
                        cursor: 'pointer',
                        boxShadow: 'none',
                        border: 0,
                        padding: 10,
                        height: 40,
                        width: '50',

                        justifyContent: 'space-between',
                        backgroundColor: getSelectionMode == 1 ? '#ffffff' : "#dedcdc",


                        alignItems: 'center',
                    }}
                >
                    <Text
                        style={{
                            color: getSelectionMode == 1 ? "#000000" : "#000000",
                            fontSize: 16,
                            fontWeight: 'bold',
                            fontFamily: 'Roboto-Medium',
                        }}>
                        {option1}
                    </Text>
                </Card>



            </div>
            <div
                style={{

                    width: 150,
                    paddingTop: 50,

                    flexDirection: 'row',
                    justifyContent: 'space-between',
                }}>



                <Card
                    onClick={() => updateSwitchData(2)}

                    style={{
                        cursor: 'pointer',
                        boxShadow: 'none',
                        border: 0,
                        padding: 10,

                        height: 40,
                        width: '50',
                        justifyContent: 'space-between',
                        backgroundColor: getSelectionMode == 2 ? '#ffffff' : "#dedcdc",


                        alignItems: 'center',
                    }}>
                    <Text
                        style={{
                            color: getSelectionMode == 2 ? '#000000' : '#000000',
                            fontSize: 16,
                            fontWeight: 'bold',
                            fontFamily: 'Roboto-Medium',
                        }}>
                        {option2}
                    </Text>
                </Card>



            </div>
        </div>
    );
}