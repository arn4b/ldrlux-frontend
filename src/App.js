import { useState, useEffect } from "react"
import logo from "./logo.svg"
import "./App.css"
import "bootstrap/dist/css/bootstrap.min.css"
import moment from "moment"

import ToggleButton from "react-bootstrap/ToggleButton"

import { Line } from "react-chartjs-2"
import { Col, Container, Row, Table } from "react-bootstrap"

const { io } = require("socket.io-client")

function App() {
	const [checked, setChecked] = useState(false)

	const [sensorData, setSensorData] = useState([])

	const [socket, setSocket] = useState(
		io(`https://iotgroupproject.herokuapp.com/`)
	)

	const [ledStatus, setLedStatus] = useState([])

	const [realtime, setRealtime] = useState(false)

	const [rtData, setRtData] = useState({})


	useEffect(() => {
		const fetchData = async () => {
			const API_URL = `https://iotgroupproject.herokuapp.com/api/data`
			const res = await fetch(API_URL)

			const data = await res.json()

			if (res.status === 200) {
				return data.details
			} else {
				alert("error")
			}
		}

		fetchData().then((data) => {
			if (data) {
				setSensorData(data)
			}
		})
	}, [])



	useEffect(() => {
		console.log(sensorData)
		console.log(sensorData.map(({ data }) => data))
	}, [sensorData])



	useEffect(() => {
		socket.on("connect", () => {
			console.log(`Connected as ${socket.id}`)
			socket.on("get-ldrval", (data) => {
			  
        setRtData(data)
			});

			socket.on("get-switch", (data) => {
				console.log(data)

				setLedStatus((cur) => [...cur, data])

				if (data.data === "ON") setChecked(true)
				else setChecked(false)
			})
		})
	}, [socket])



	useEffect(() => {
		console.log(ledStatus)
	}, [ledStatus])

  
	useEffect(() => {
		if (realtime) {
		setSensorData((cur) => [...cur, rtData])
		}
	}, [realtime, rtData])


	const data = {
		labels: [
			...sensorData.map(({ timestamp }) => moment(timestamp).format("LLL")),
		],
		datasets: [
			{
				label: "Intensity of Light",
				data: [...sensorData.map(({ data }) => data)],
				fill: false,
				backgroundColor: 'rgb(114, 0, 0)',
				borderColor: 'rgba(114, 0, 0, 0.638)',
			},
		],
	}

	const leddata = {
		labels: [
			...ledStatus.map(({ timestamp }) => moment(timestamp).format("LLL")),
		],
		datasets: [
			{
				label: "LED Status",
				data: [...ledStatus.map(({ data }) => (data === "ON" ? 1 : 0))],
				fill: false,
				backgroundColor: 'rgb(114, 0, 0)',
				borderColor: 'rgba(114, 0, 0, 0.638)',
			},
		],
	}

	const options = {
		scales: {
			y: {
				beginAtZero: true,
				xAxes: [
					{
						type: "time",
						ticks: {
							autoSkip: true,
							maxTicksLimit: 20,
						},
					},
				],
			},
		},
	}

	return (
		<div className='App'>
			<div className='text'>
				<h1> Light Dependent Resistor Based Automation</h1>
			</div>
			<header className='App-header'>
				<div className='chart1'>
          			<h1 style={{textAlign: 'center'}}>Intensity vs Time Chart</h1>
					<Line data={data} options={options} />
				</div>

				<div className="led-console" style={{width: '50%'}}>
				<h3>Sensor Capture Toggle</h3>

				<ToggleButton
					className='mb-2 led-button'
					id='toggle-check1'
					type='checkbox'
					variant='outline-success'
					size='lg'
					checked={realtime}
					onChange={(e) => setRealtime(e.currentTarget.checked)}
				>
					{realtime ? "Turn off capture" : "Turn on capture"}
				</ToggleButton>
				</div>

				<div className='chart1'>
					<Line data={leddata} options={options} />
				</div>
			</header>

      <div className="led-console">

        <h3>LED Toggle</h3>

        <ToggleButton
          className='mb-2 led-button'
          id='toggle-check'
          type='checkbox'
          variant='outline-success'
          size='lg'
          checked={checked}
          value='1'
          onChange={(e) => setChecked(e.currentTarget.checked)}
          onClick={async (e) => {
            const API_URL = `https://iotgroupproject.herokuapp.com/api/switch/${
              checked ? "OFF" : "ON"
            }`
            const res = await fetch(API_URL)
            const result = await fetch(res)
            if (res.status !== 200) {
              console.log("error")
            }
          }}
        >
          {checked ? "Turn OFF" : "Turn ON"}
        </ToggleButton>
      </div>

      <Container>
        <Row >
          <Col style={{display: 'flex'}}>
            <div className="mem-list">
              <h1>Project By:</h1>
              <ul>
                <li>1928019 Arnab Chatterjee</li>
                <li>1928021 Ayantika Bhaumik</li>
                <li>1928043 Patrali Sarkar</li>
                <li>1928045 Pratyay Saha</li>
                <li>1928066 Swagata Chanda</li>
              </ul>
            </div>
          </Col>


          <Col>
            <div>
              <h1>Documentation and Source Code:</h1>
              <div className="docs">
                <a target="__blank" href="https://github.com/arn4b/ldrlux-frontend"><p>Frontend Source Code</p></a>
                <a target="__blank" href="https://github.com/swagatachanda/iotProject/blob/master/iotScripts/iotmqtt.py"><p>MQTT Python Source Code</p></a>
                <a target="__blank" href="https://github.com/swagatachanda/iotProject"><p>Backend Source Code</p></a>
                <a target="__blank" href="https://documenter.getpostman.com/view/14983874/UVC3koRP"><p>API Documentation</p></a>
                <a target="__blank" href="https://hackmd.io/@psaha/iotproject"><p>Project Documentation</p></a>
              </div>
            </div>
          </Col>
        </Row>

		<div>
			<h1>Tech Stack Used:</h1>

			<Table striped borderless hover style={{textAlign: 'center'}} className="tablee">
				<thead>
					<tr>
					<th>Frontend</th>
					<th>Backend</th>
					<th>Database</th>
					<th>IOT</th>
					<th>Deployment</th>
					</tr>
				</thead>
				<tbody>
					<tr>
					
					<td>ReactJS</td>
					<td>NodeJS</td>
					<td>MongoDB</td>
					<td>Mosquito MQTT</td>
					<td>DigitalOcean</td>
					</tr>
					<tr>
					
					<td>ChartJS</td>
					<td>SocketIO</td>
					<td>-</td>
					<td>-</td>
					<td>Heroku</td>
					</tr>
					<tr>
					
					<td>React Bootstrap</td>
					<td>Python (Arduino)</td>
					<td>-</td>
					<td>-</td>
					<td>Cloudflare Pages</td>
					</tr>
				</tbody>
			</Table>
		</div>
      </Container>



		</div>
	)
}

export default App
