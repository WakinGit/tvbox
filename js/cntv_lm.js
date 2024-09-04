// 无搜索功能
import { _ } from '../lib/cat.js';
import {log} from '../lib/utils.js';
let HOST = 'http://api.cntv.cn';
let siteKey = '';
let siteType = 0;
const MOBILE_UA = 'Mozilla/5.0 (Linux; Android 11; M2007J3SC Build/RKQ1.200826.002; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/77.0.3865.120 MQQBrowser/6.2 TBS/045714 Mobile Safari/537.36';

async function request(reqUrl, agentSp) {
    let res = await req(reqUrl, {
        method: 'get',
        headers: {
            'User-Agent': agentSp || MOBILE_UA,
        },
    });
    return res.content
}

async function init(cfg) {
    siteKey = cfg.skey;
    siteType = cfg.stype;
}

async function home(filter) {
    const classes = [ 
        { type_id: "EPGC1386744804340101", type_name: "CCTV-1" },
        { type_id: "EPGC1386744804340102", type_name: "CCTV-2" },
        { type_id: "EPGC1386744804340103", type_name: "CCTV-3" },
        { type_id: "EPGC1386744804340104", type_name: "CCTV-4" },
        { type_id: "EPGC1386744804340107", type_name: "CCTV-5" },
        { type_id: "EPGC1386744804340108", type_name: "CCTV-6" },
        { type_id: "EPGC1386744804340109", type_name: "CCTV-7" },
        { type_id: "EPGC1386744804340110", type_name: "CCTV-8" },
        { type_id: "EPGC1386744804340112", type_name: "CCTV-9" },
        { type_id: "EPGC1386744804340113", type_name: "CCTV-10" },
        { type_id: "EPGC1386744804340114", type_name: "CCTV-11" },
        { type_id: "EPGC1386744804340115", type_name: "CCTV-12" },
        { type_id: "EPGC1386744804340116", type_name: "CCTV-13" },
        { type_id: "EPGC1386744804340117", type_name: "CCTV-14" },
        { type_id: "EPGC1386744804340118", type_name: "CCTV-15" },
        { type_id: "EPGC1634630207058998", type_name: "CCTV-16" },
        { type_id: "EPGC1563932742616872", type_name: "CCTV-17" },
        { type_id: "EPGC1468294755566101", type_name: "CCTV-5+" }
        ];
    const filterObj = {};
    return JSON.stringify({
        class: _.map(classes, (cls) => {
            cls.land = 1;
            cls.ratio = 1.78;
            return cls;
        }),
        filters: filterObj,
    })
}

async function homeVod() {
    return '{}';
}

async function category(cid, pg, filter, extend) {
    if (pg <= 0 || typeof pg == 'undefined') pg = 1;
    const data = JSON.parse(await request(HOST + '/lanmu/columnSearch?&fl=&fc=&cid=' + cid + '&n=10&p=' + pg + '&serviceId=tvcctv'));
    let videos = _.map(data.response.docs, (it) => {
        return {
            vod_id: it.column_website,
            vod_name: it.column_name,
            vod_pic: it.column_logo,
            vod_remarks: it.lastVIDE.videoTitle || '',
        }
    });
    const pgChk = JSON.parse(await request(HOST + '/lanmu/columnSearch?&fl=&fc=&cid=' + cid + '&n=10&p=' + (parseInt(pg) + 1) + '&serviceId=tvcctv')).response.docs;
    const pgCount = pgChk.length > 0 ? parseInt(pg) + 1 : parseInt(pg);
    return JSON.stringify({
        page: parseInt(pg),
        pagecount: parseInt(pgCount),
        limit: 10,
        total: parseInt(data.total),
        list: videos,
    })
}

async function detail(id) {
    const resp = await request(id);
    const topId = resp.match(/(TOPC\d{16})/)[1];
    const docs = JSON.parse(await request(HOST + '/NewVideo/getVideoListByColumn?id=' + topId + '&n=100&sort=desc&p=1&mode=0&serviceId=tvcctv')).data.list;
    let playlist = [];
    _.map(docs, (doc) => {
        // let video= doc.title + '$' + 'https://hls.cntv.myhwcdn.cn/asp/hls/2000/0303000a/3/default/' + doc.guid + '/2000.m3u8'
        let video= doc.title + '$' + doc.guid ;
        playlist.push(video);
    });
    const vod = {
        vod_id: topId,
        vod_remarks: '',
    };
    vod.vod_play_from = '超清';
    vod.vod_play_url = playlist.join('#');
    return JSON.stringify({
        list: [vod],
    })
}

async function play(flag, id, flags) {
    // console.debug('视聚场 id =====>' + id); // js_debug.log
    let videoJson = JSON.parse(await request("https://vdn.apps.cntv.cn/api/getHttpVideoInfo.do?pid="+id));
    return JSON.stringify({
        parse: 0,
        url: videoJson.hls_url
    })
}

async function search(wd, quick, pg) {
    return '{}'
}

export function __jsEvalReturn() {
    return {
        init: init,
        home: home,
        homeVod: homeVod,
        category: category,
        detail: detail,
        play: play,
        search: search,
    }
}