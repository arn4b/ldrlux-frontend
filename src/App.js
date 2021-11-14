import { useState, useEffect } from "react"
import logo from "./logo.svg"
import "./App.css"
import "bootstrap/dist/css/bootstrap.min.css"
import moment from "moment"

import ToggleButton from "react-bootstrap/ToggleButton"

import { Line } from "react-chartjs-2"

const { io } = require("socket.io-client")

function App() {
	const [checked, setChecked] = useState(false)

	const [sensorData, setSensorData] = useState([])

	const [socket, setSocket] = useState(
		io(`https://iotgroupproject.herokuapp.com/`)
	)

	const [ledStatus, setLedStatus] = useState([])

	const [chartData, setChartData] = useState({})

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
			// socket.on("get-ldrval", (data) => {
			//   console.log(data)
			//   setSensorData((cur) => [...cur, data]);
			// });

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

	const getRandomColor = () => {
		var letters = "0123456789ABCDEF"
		var color = "#"
		for (var i = 0; i < 6; i++) {
			color += letters[Math.floor(Math.random() * 16)]
		}
		return color
	}
	const data = {
		labels: [
			...sensorData.map(({ timestamp }) => moment(timestamp).format("LLL")),
		],
		datasets: [
			{
				label: "Intensity of Light",
				data: [...sensorData.map(({ data }) => data)],
				fill: false,
				backgroundColor: getRandomColor(),
				borderColor: getRandomColor(),
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
				<h1>IOT PROJECT - LDR BASED AUTOMATION</h1>
			</div>
			<header className='App-header'>
				<div className='chart1'>
					<Line className='chart1' data={data} options={options} />
				</div>
			</header>

			<ToggleButton
				className='mb-2'
				id='toggle-check'
				type='checkbox'
				variant='outline-warning'
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
	)
}

export default App
