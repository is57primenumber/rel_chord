import { createRoot } from 'react-dom/client'
import Switch from '@mui/material/Switch';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack'

//toggle buttonを作成する
create_toggle_button()

//表示する絶対コードと相対コードのリスト
const abs_chords = []
const rel_chords = []

//キーとコードを選択
const keys_and_chords = document.querySelectorAll(".key,.chord")

//曲の今のキー
let key_num = -1;
//曲のキーとコードを順に回していく
for (const key_and_chord of keys_and_chords) {
    if (key_and_chord.className === "key") {
        //それぞれのキーに対して
        const key = key_and_chord.textContent
        //キーをCを基準とした数字に変換
        //example: "Key: E" => 4
        key_num = key_to_num(key)
    } else {
        //それぞれのコードに対して
        const abs_chord = key_and_chord.textContent
        abs_chords.push(abs_chord)
        //キーが未定義のときは絶対コードをそのまま相対コードとする
        if (key_num === -1) {
            rel_chords.push(abs_chord)
        } else {
            //絶対コードを相対コードに変換
            const rel_chord = convert(abs_chord)
            //nullかどうかで成功判定、失敗したら絶対コードをそのまま相対コードとする
            if (rel_chord != null) {
                rel_chords.push(rel_chord)
            } else {
                rel_chords.push(abs_chord)
            }
        }
    }
}

//トグルボタンを作成
function create_toggle_button() {
    const h2 = document.getElementsByClassName("subtitle")[0]
    const container = document.createElement('div')
    h2.after(container)

    const toggle_button =
        <Stack direction="row" alignItems="center">
            <Typography>絶対</Typography>
            <Switch onChange={onChange} />
            <Typography>相対</Typography>
        </Stack>
    const con = createRoot(container)
    con.render(toggle_button)
}

//キーをCを基準とした数字に変換
//example: "Key: E" => 4
function key_to_num(key) {
    chord_to_num(key.substring(5))[0]
}

//トグルボタンが押されたときの処理
function onChange(event) {
    //トグルボタンがオンのときは相対コードを表示
    if (event.target.checked) {
        const chords = document.getElementsByClassName('chord')
        for (let i = 0; i < chords.length; i++) {
            chords[i].textContent = rel_chords[i]
        }
    } else {
        //トグルボタンがオフのときは絶対コードを表示
        const chords = document.getElementsByClassName('chord')
        for (let i = 0; i < chords.length; i++) {
            chords[i].textContent = abs_chords[i]
        }
    }
}

//絶対コードを相対コードに変換する
function convert(abs_chord) {
    //括弧があるときは括弧の中身を変換してから括弧をつける
    //example: "(Caug)" => "(Iaug)" (key = Cの時)
    if (abs_chord[0] == '(' && abs_chord.endsWith(')')) {
        const result = convert_chord(abs_chord.substring(1, abs_chord.length - 1))
        return '(' + result + ')'
    }
    return convert_chord(abs_chord)
}

function convert_chord(abs_chord) {
    //オンコードがあるときは"/"のindex
    //ないときは-1
    //"/"で分離してそれぞれを普通のコードとして変換してから結合する
    const loc = abs_chord.search('/')
    const on_chord = abs_chord.substring(loc + 1)
    const rel_on_chord = convert_norm(on_chord)
    const rel_chord = convert_norm(abs_chord.substring(0, loc + 1))
    return rel_chord + rel_on_chord
}

//オンコードでもなく、括弧が外側についてもいないときの相対コードへの変換
function convert_norm(abs_chord) {
    let [abs_num, abs_tmp] = chord_to_num(abs_chord)
    if (abs_num == null) {
        return abs_chord
    }
    let rel = num_to_rel((abs_num - key_num + 12) % 12, abs_tmp)
    if (abs_tmp != null) {
        return rel + abs_chord.substring(2)
    } else {
        return rel + abs_chord.substring(1)
    }
}

//コードをC基準の数字に変換する
//tmpは臨時記号で#かbかnull
//example: "C#aug" => [1, "#"]
function chord_to_num(chord) {
    let tmp = null;
    let num = null;
    switch (chord[0]) {
        case 'C':
            num = 0;
            break;
        case 'D':
            num = 2;
            break;
        case 'E':
            num = 4;
            break;
        case 'F':
            num = 5;
            break;
        case 'G':
            num = 7;
            break;
        case 'A':
            num = 9;
            break;
        case 'B':
            num = 11;
            break;
    }
    if (chord.length >= 2) {
        switch (chord[1]) {
            case '#':
                num = (num + 1) % 12
                tmp = '#'
                break;
            case 'b':
                num = (num - 1) % 12
                tmp = 'b'
                break;
        }
    }
    return [num, tmp];
}

//C基準の数字を相対コードに変換する
//C基準の数字がダイアトニックに含まれないときは絶対コードに付いていた臨時記号を考慮する
//example: num = 1であり、tmp = "b"のとき"IIb"を返す
function num_to_rel(num, tmp) {
    if (!is_diatonic(num)) {
        if (tmp === 'b') {
            num += 1;
            return diatonic_num_to_rel(num) + 'b'
        } else {
            num -= 1;
            return diatonic_num_to_rel(num) + '#'
        }
    } else {
        return diatonic_num_to_rel(num)
    }

}
//C基準の数字を相対コードに変換する
//ただしnumはダイアトニックに含まれる数字であることを前提とする
function diatonic_num_to_rel(num) {
    let rel = null;
    switch (num) {
        case 0:
            rel = 'I'
            break;
        case 2:
            rel = 'II'
            break;
        case 4:
            rel = 'III'
            break;
        case 5:
            rel = 'IV'
            break;
        case 7:
            rel = 'V'
            break;
        case 9:
            rel = 'VI'
            break;
        case 11:
            rel = 'VII'
            break;
    }
    return rel;
}

//数字がダイアトニックに含まれるかどうか
function is_diatonic(num) {
    return [0, 2, 4, 5, 7, 9, 11].includes(num)
}
