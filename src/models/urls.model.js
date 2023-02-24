//NPM MODULES
const { groupBy } = require("async");
const { option } = require("../../connectSQL");
const knex = require('knex')(option);

let rell = []
let date_1;
let date_2;
let days;
//Connect myDB's Tables

class Data {

  static async addChange(campaign_id) {
    const changedData = await knex('links').update({change: 'inactive'}).where('campaign_id', '=', campaign_id);
    const changedurlData = await knex('urls').update({change: 'inactive'}).where('campaign_id', '=', campaign_id);
    return 1

  }
  static async insertUrls(data) {
    for (let int in data) {
      const insertData = await knex('urls').insert({ external_urls: data[int] });

    }
  }

  static async getUrls() {

    const selectNullableData = await knex.from('urls').select('external_urls',).where('robot_tag',null)
      .orderBy('id');

    return selectNullableData;


  }
  static async delData(offset, limit) {
    const del = await knex('urls').del().where('robot_tag',null)
  }




  static async linksChange() {
    const change = await knex.from('links').select('urls', 'robot_tag', 'title', 'favicon', 'status', 'id').orderBy('id');
    if (change) {

      return change
    } else {
      console.log('թարմացնելու  տվյալներ չկան․․․');
    }

  }


  static async getNull() {
    const nullData = await knex.from('urls').select('id').where('changeing', null)
    if (nullData.length > 0) {
      return nullData.length
    } else {
      console.log('թարմացնելու  տվյալներ չկան․․․')
    }
  }

  static async getLinks(offset, limit) {
    const y = await knex.from('links').select('urls', 'id').orderBy('id').limit(limit).offset(offset)
    return y
  }
  

  static async getIds() {
    const z = await knex.from('urls').select('id').orderBy('id').where('change','=','inactive')
    return z

  }
  static async changeing() {
    const changerel = await knex.from('urls').select('rel', 'external_urls','robot_tag', 'id').orderBy('id').where('changeing',null);
    const changekeyword = await knex.from('urls').select('keyword','status', 'id').orderBy('id').where('changeing',null);

    return [changerel, changekeyword]
  }

  static async getLimit() {
    const count = await knex.from('urls').select('robot_tag').groupBy('id').where('robot_tag',null)
    if (count.length > 0) {
      return count.length
    } else {
      console.log('թարմացնելու  տվյալներ չկան․․․')
    }
  }

  static async deleteUrls(ids) {
    const delLinks = await knex.from('links').del().whereIn('id', ids).returning('*');
    const delUrls = await knex.from('urls').del().whereIn('links_id', ids).returning('*');

    return [delLinks, delUrls]
  }


  static async getLiveUrls() {
    const getLive = await knex.from('urls').count('id').where('status', '=', 200)
    console.log(getLive);

    return getLive
  }

  static async getCrawled() {
    let countupdate = 0;
    let leftcountupdate = 0;
    const getDofollow = await knex.from('urls').count('id').where('rel', '=', 'dofollow');
    const getNofollow = await knex.from('urls').count('id').where('rel', '=', 'nofollow');
    const selectChangeing = await knex.from('urls').select('changeing');

    for (let index = 0; index < selectChangeing.length; index++) {
      if (selectChangeing[index].changeing === null) {
        leftcountupdate += 1
      } else {
        countupdate += 1
      }
    }
    return { "dofollowCount": Number(getDofollow[0].count), "nofollowCount": Number(getNofollow[0].count), "crawledTodayCount": countupdate, "leftForCrawlingCount": leftcountupdate }

  }

  static async getCrawledById(userId) {
    let countupdate = 0;
    let leftcountupdate = 0;
    const getDofollow = await knex.from('urls').count('id').where('rel', '=', 'dofollow').andWhere('user_id', '=', userId);
    const getNofollow = await knex.from('urls').count('id').where('rel', '=', 'nofollow').andWhere('user_id', '=', userId);
    const selectChangeing = await knex.from('urls').select('changeing').where('user_id', '=', userId);

    for (let index = 0; index < selectChangeing.length; index++) {
      if (selectChangeing[index].changeing === null) {
        leftcountupdate += 1
      } else {
        countupdate += 1
      }
    }

    return { "dofollowCount": Number(getDofollow[0].count), "nofollowCount": Number(getNofollow[0].count), "crawledTodayCount": countupdate, "leftForCrawlingCount": leftcountupdate }

  }


  static async getCrawledLinksCountById(userId) {
    const links = await knex.from('links').count('id').where('user_id', '=', userId);
    return links;
  }

  static async getChangesById(userId, campaignId) {
   const joinsLinks = await knex.select('*').from('links').innerJoin('changes', function() {
      this
        .on('links.campaign_id', '=', 'changes.campaign_id')
    });

    const joinsUrls = await knex.select('*').from('urls').innerJoin('changes', function() {
      this
        .on('urls.campaign_id', '=', 'changes.campaign_id')
    }).whereNotNull('changeing');

    return { linksChanges: joinsLinks.length, urlsChanges: joinsUrls.length};
  }


  static async getFailed() {
    const failedData = await knex.from('urls').count('id').whereNotNull('changeing')
    return failedData

  }

  static async getChanges() {
    const changeLinks = await knex.from('links').select('campaign_id','user_id').where('changeing',null);
    
    return changeLinks
  }

  static async getExternalWithCheck(){
    const externalUrls = await knex.from('urls').select('external_urls','id').orderBy('id').where('changeing',null)//.where('status','=','active').andWhere('updated_at','-',new Date(),'<',24 );
    return externalUrls
  }





}
module.exports = Data

