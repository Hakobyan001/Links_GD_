// NPM Modules
const knex = require('knex');

const knexConfigs = require('../knex.configs');

// Local Modules

function up(pg) {
    return pg.schema
      .createTable('links', (table) => {
        table.increments('id').primary();
        table.string('urls');
        table.enum('robot_tag', ['indexable', 'noindexable']);
        table.string('title');
        table.string('favicon');
        table.integer('status');
        table.json('changeing');
        table.integer('campaign_id');
        table.integer('user_id');
        table.dateTime('created_at');
        table.dateTime('updated_at');
        table.enum('change',['active', 'inactive']).default('active')
      })
      .createTable('urls', (table) => {
        table.increments('id').primary();
        table.string('external_urls');
        table.enum('rel', ['dofollow', 'nofollow']);
        table.string('keyword');
        table.enum('robot_tag', ['indexable', 'noindexable']);
        table.integer('status');
        table.json('changeing');
        table.json('changeing_status');
        table.integer('campaign_id');
        table.integer('user_id');
        table.string('main_link');
        table.integer('links_id');
        table.dateTime('created_at');
        table.dateTime('updated_at');
        table.enum('change',['active', 'inactive']).default('active') 
      })
      .createTable('changes', (table) => {
        table.integer('campaign_id');
        table.integer('user_id');
        table.dateTime('created_at');
      });
  }
async function init() {
    try {
        const options = process.env.NODE_ENV === 'production'
            ? knexConfigs.production
            : knexConfigs.development;
        const pg = knex(options);
        await up(pg);
        console.log('Successfully created all tables ... ');
    } catch (error) {
        console.log(error);
    }
}

init();
