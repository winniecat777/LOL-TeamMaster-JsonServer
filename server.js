const jsonServer = require('json-server')
const jsonServerAuth = require('json-server-auth');
const data = require('./db.json');
const server = jsonServer.create()
const router = jsonServer.router('db.json')
const middlewares = jsonServer.defaults()

server.db = router.db
server.use(middlewares)
server.use(jsonServerAuth)

server.get('/teamsMember/:id', (req, res) => {

    const teamId = req.params.id;
    let teamMembers =[]
    if (data.teams[teamId]) {
        const team = data.teams.filter(item => item.id === parseInt(teamId))
        const teamMerberId=team[0].teamMerberId
        teamMerberId.forEach((v)=>{

            const teamMember =data.users.find((i)=>i.id === v)
            teamMembers.push(teamMember)
        })
        // console.log(teamMembers)
        res.status(200).json(teamMembers);

    } else {
        res.status(404).json({ message: '找不到隊伍' });
    }

  });

server.get('/teamsThumb', (req, res, next) => {
  let sort = req.query._sort;

 let teamsThumb = data.teams.map(team => {
    let thumb=data.users.find((v)=>{return v.id === team.userId}).thumb
    return {
      ...team,
      thumb
    };
  });
      let sortedTeams = []
      if(sort === "desc"){
        sortedTeams=teamsThumb.sort((a, b) => b.thumb - a.thumb);
      }else if(sort === "asc"){
        sortedTeams=teamsThumb.sort((a, b) => a.thumb - b.thumb);
      }else{
        sortedTeams=teamsThumb
      }

  res.status(200).json(sortedTeams)

});


server.get('/countThumbs/:id', (req, res) => {
  const commentedId = req.params.id;
  let thumbData = [];

  data.comments.filter((item) => {
    if (item.commentedId === parseInt(commentedId)) {
      thumbData.push(item);
    };
  });

  if (thumbData.length !== 0) {
    let totalThumbData = {
      thumbCount: thumbData.length,
      thumbData: thumbData
    };

    res.status(200).json(totalThumbData);
  } else {
    res.status(404).json({ message: '沒有人點讚' });
  }
});

server.get('/teamsHistorical/:id', (req, res) => {
  const userId = req.params.id;
  let countMembers = 0;
  let teamsHistoricalData = [];
  let teamsData = [];
  let teamMembers = [];
  let membersDetail = [];
  let insideData = [];
  let thumbData = [];
  let totalHistoricalData = [];
  let dataFormat = {};

  data.teamsHistory.filter((item) => {
    if (item.userId === parseInt(userId)) {
      teamsHistoricalData.push(item.teamId);
    };
  });

  if (teamsHistoricalData.length !== 0) {
      teamsData = data.teams.filter((item) => {
        return teamsHistoricalData.includes(item.id);
      });

    teamsData.forEach((item) => {
      countMembers = 0;
      teamMembers = item.teamMerberId;

      teamMembers.forEach((user) => {
        if (user === 0) {
          insideData.push("waiting");
        } else {
          membersDetail = data.users.find((member) => {
            return user === member.id;
          });
          insideData.push(membersDetail);
          countMembers++;
        };
      });

      teamMembers = [...insideData];
      insideData.length = 0;

      data.comments.filter((thumb) => {
        if (thumb.commentedId === item.userId) {
          thumbData.push(thumb);
        };
      });

      dataFormat = {
        teamName: item.teamName,
        playTime: item.playTime,
        userId: item.userId,
        thumb: thumbData.length,
        membersDetail: teamMembers,
        countMembers: countMembers
        };

        totalHistoricalData.push(dataFormat);
      });

        res.status(200).json(totalHistoricalData);
  } else {
        res.status(404).json({ message: '沒有歷史組隊紀錄' });
  }
});

server.use(router)

server.listen(3000, () => {
    console.log('JSON Server is running')
  })
