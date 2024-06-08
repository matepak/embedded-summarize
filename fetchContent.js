const axios = require('axios');
const cheerio = require('cheerio');

const fetchContent = async (url) => {
    try {
        const { data } = await axios.get(url);
        const $ = cheerio.load(data);

        $('script, style, header, footer, nav, aside').remove();

        let content = '';
        $('article, main').each((i, elem) => {
            content += $(elem).text();
        });

        if (!content) {
            content = $('body').text();
        }

        content = content.replace(/\s+/g, ' ').trim();

        return content;
    } catch (error) {
        throw new Error(`Error fetching content: ${error.message}`);
    }
};

module.exports = fetchContent;
