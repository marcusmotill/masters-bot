import React, { Component } from 'react';
import { Collapse, Table, Tabs, Tab } from 'react-bootstrap';
import './App.css';

export default class App extends Component {
    state = {
        leaderData: [],
    };

    openDetails(index) {
        this.setState((state) => {
            state.leaderData[index].open = !state.leaderData[index].open;
            return state;
        });
    }

    componentDidMount() {
        fetch('/leaders')
            .then((res) => res.json())
            .then((json) => {
                console.log(json);
                return json;
            })
            .then((leaderData) => this.setState({ leaderData }));
    }

    render() {
        return (
            <div className="App">
                <div className="App-header">⛳</div>
                <div className="score-container">
                    {this.state.leaderData.map((leader, index) => (
                        <div>
                            <div className="App-link" onClick={() => this.openDetails(index)}>
                                ▾ {index + 1} ({leader.score}). {leader.name}
                            </div>
                            <Collapse in={this.state.leaderData[index].open}>
                                <div>
                                    <Tabs defaultActiveKey="total">
                                        <Tab eventKey="total" title="Total">
                                            <div>
                                                <Table striped bordered hover variant="dark" responsive>
                                                    <thead>
                                                        <tr>
                                                            <th>#</th>
                                                            <th>Player</th>
                                                            <th>Total Score</th>
                                                            <th>Position (Score)</th>
                                                            <th>Eagles (Score)</th>
                                                            <th>Birdies (Score)</th>
                                                            <th>Pars (Score)</th>
                                                            <th>Bogeys (Score)</th>
                                                            <th>Doubles+ (Score)</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {leader.players.map((player, index) => (
                                                            <tr>
                                                                <td>{index + 1}</td>
                                                                <td>{player.name}</td>
                                                                <td>{player.score}</td>
                                                                <td>{player.rank}</td>
                                                                <td>{player.eagles}</td>
                                                                <td>{player.birdies}</td>
                                                                <td>{player.pars}</td>
                                                                <td>{player.bogeys}</td>
                                                                <td>{player.doubles}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </Table>
                                            </div>
                                        </Tab>
                                        {leader.rounds.map((round, index) => (
                                            <Tab
                                                eventKey={`round${index}`}
                                                title={`Round ${index + 1}`}
                                            >
                                                <div>
                                                <Table striped bordered hover variant="dark" responsive>
                                                    <thead>
                                                        <tr>
                                                            <th>#</th>
                                                            <th>Player</th>
                                                            <th>Total Score</th>
                                                            <th>Position (Score)</th>
                                                            <th>Eagles (Score)</th>
                                                            <th>Birdies (Score)</th>
                                                            <th>Pars (Score)</th>
                                                            <th>Bogeys (Score)</th>
                                                            <th>Doubles+ (Score)</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {round.map((player, index) => (
                                                            <tr>
                                                                <td>{index + 1}</td>
                                                                <td>{player.name}</td>
                                                                <td>{player.score}</td>
                                                                <td>{player.rank}</td>
                                                                <td>{player.eagles}</td>
                                                                <td>{player.birdies}</td>
                                                                <td>{player.pars}</td>
                                                                <td>{player.bogeys}</td>
                                                                <td>{player.doubles}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </Table>
                                            </div>
                                            </Tab>
                                        ))}
                                    </Tabs>
                                </div>
                            </Collapse>
                        </div>
                    ))}
                </div>
            </div>
        );
    }
}
