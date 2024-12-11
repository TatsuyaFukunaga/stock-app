import React, { useState } from "react";
import { TextField, Button, Select, MenuItem } from "@mui/material";
import axios from "axios";
import { Line } from 'react-chartjs-2'
import {
    Chart as ChartJS,
    CategoryScale,
    ChartData,
} from 'chart.js'
import Chart from 'chart.js/auto';


Chart.register(CategoryScale);

const StockApp = () => {
    const [ticker, setTicker] = useState("");
    const [period, setPeriod] = useState("1mo");
    const [graghLabel, setGraghLabel] = useState<string[]>([]);
    const [stockPrice, setStockPrice] = useState<number[]>([]);
    const [data, setData] = useState<ChartData<'line'>>();

    // const data: ChartData<'line'> = null;



    const fetchStockData = async () => {
        try {
            // 状態をリセット
            setGraghLabel([]); // 既存のラベルをクリア
            setStockPrice([]); // 既存の株価をクリア
            setData(null); // データをクリア

            const response = await axios.post("http://localhost:8000/api/stock", {
                ticker,
                period,
            });

            // 404エ��ーの場合
            if (response.status === 404) {
                alert("データがありません");
                return; // 処理を終了
            }

            // 新しいデータを取得
            const newGraghLabel: string[] = [];
            const newStockPrice: number[] = [];

            response.data.map((point: any) => {
                newGraghLabel.push(point.date);
                newStockPrice.push(point.price);
                return point;
            });

            // 状態を更新
            setGraghLabel(newGraghLabel);
            setStockPrice(newStockPrice);

            const dataA: ChartData<'line'> = {
                labels: newGraghLabel,
                datasets: [
                    {
                        label: `${ticker.toString()}の株価`,
                        data: newStockPrice,
                        fill: true,
                        backgroundColor: "rgba(75,192,192,0.2)",
                        borderColor: "rgba(75,192,192,1)"
                    },
                ],
            };

            // dataを設定
            setData(dataA); // ここでdataAを使用

        } catch (error) {
            // エラーが404の場合
            if (axios.isAxiosError(error) && error.response?.status === 404) {
                alert("データがありません");
            } else {
                console.error("Error fetching stock data:", error);
            }
        }
    };

    const handleSubmit = () => {
        fetchStockData();
    };


    return (
        <div>
            <TextField
                label="証券コード"
                value={ticker}
                onChange={(e) => setTicker(e.target.value)}
            />
            <Select
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
            >
                <MenuItem value="1mo">1か月</MenuItem>
                <MenuItem value="3mo">3か月</MenuItem>
                <MenuItem value="6mo">6か月</MenuItem>
                <MenuItem value="1y">1年</MenuItem>
                <MenuItem value="2y">2年</MenuItem>
                <MenuItem value="5y">5年</MenuItem>
            </Select>
            <Button onClick={handleSubmit}>グラフ表示</Button>
            <Line data={data ? data : {
                labels: graghLabel,
                datasets: [{
                    label: `${ticker.toString()}の株価`,
                    data: stockPrice,
                }]
            }} />
        </div>
    );
};

export default StockApp;
