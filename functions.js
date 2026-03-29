import { LIST_LIMIT, FALLBACK_EXCHANGE_RATES, CURRENCIES } from "./constants";

export function timeToFullDate (timeString) {
    if(!timeString){
        return ''
    }
    const dateObj = new Date(timeString);
    const optionsDate = { day: 'numeric', month: 'short', year: 'numeric' };
    const dateFormatted = dateObj.toLocaleDateString('en-IN', optionsDate);
    return dateFormatted;
}

export function formatDate(inputDate) {
    let date = inputDate ? new Date(inputDate) : new Date();
    let year = date.getFullYear();
    let month = String(date.getMonth() + 1).padStart(2, '0');
    let day = String(date.getDate()).padStart(2, '0');
    let hours = String(date.getHours()).padStart(2, '0');
    let minutes = String(date.getMinutes()).padStart(2, '0');
    let seconds = String(date.getSeconds()).padStart(2, '0');
    let formattedDate = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;

    return formattedDate;
}

export function csvToArray(csvString) {
  if(!csvString) return null
  return csvString.split(',').map(item => item.trim()).filter(item => item !== '');
}

export function slugify(str) {
    if (!str) return '';
    return str
      .toLowerCase() // Convert to lowercase
      .trim() // Remove leading/trailing spaces
      .replace(/[^\w\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/--+/g, '-') // Replace multiple hyphens with single hyphen
      .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
  }

export function calculateTotalPages(totalItems,limit = LIST_LIMIT){
    let pages = Math.ceil(totalItems / limit)
    return pages
}

export const updateMetaTag = (property,content,isOg = false) => {
  if (typeof document === 'undefined') return;

  const selector = isOg ? `meta[property="${property}"]` : `meta[name="${property}"]`;
  let tag = document.querySelector(selector);

  if (tag) {
    tag.setAttribute('content', content);
  } else {
    tag = document.createElement('meta');
    if (isOg) tag.setAttribute('property', property);
    else tag.setAttribute('name', property);
    tag.setAttribute('content', content);
    document.head.appendChild(tag);
  }
};

export function formatNumber(num, currencyCode = 'INR', exchangeRates = null) {
  if (num == null || num === '') return '0';

  // Get currency info
  const currency = CURRENCIES.find(c => c.code === currencyCode) || CURRENCIES[0];
  const { symbol } = currency;

  // Get exchange rate from provided rates or fallback
  const rates = exchangeRates || FALLBACK_EXCHANGE_RATES;
  const rate = rates[currencyCode] || FALLBACK_EXCHANGE_RATES[currencyCode] || 1;

  // Convert from INR to target currency
  let convertedNum = parseFloat(num) * rate;

  // Handle NaN
  if (isNaN(convertedNum)) {
    console.error('formatNumber: Invalid number input', num);
    return `${symbol}0`;
  }

  // Round to 2 decimal places
  convertedNum = Math.round(convertedNum * 100) / 100;

  let [integerPart, decimalPart] = convertedNum.toString().split('.');

  let formatted;

  if (currencyCode === 'INR') {
    // Indian numbering system (e.g., 1,00,000)
    let lastThree = integerPart.slice(-3);
    let otherDigits = integerPart.slice(0, -3);

    if (otherDigits !== '') {
      lastThree = ',' + lastThree;
    }

    formatted = otherDigits.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + lastThree;
  } else {
    // International numbering system (e.g., 100,000)
    formatted = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

  // Add decimal part if exists
  if (decimalPart) {
    formatted += '.' + decimalPart.slice(0, 2); // Limit to 2 decimal places
  }

  return `${symbol}${formatted}`;
}

export function setMetaTags({
  title,
  meta_title,
  meta_description,
  meta_keywords
} = {}) {

  if (title) {
    document.title = title;
  }

  if (meta_title) {
    let ogTitle = document.querySelector("meta[property='og:title']");
    if (!ogTitle) {
      ogTitle = document.createElement('meta');
      ogTitle.setAttribute('property', 'og:title');
      document.head.appendChild(ogTitle);
    }
    ogTitle.setAttribute('content', meta_title);
  }

  if (meta_description) {
    let description = document.querySelector("meta[name='description']");
    if (!description) {
      description = document.createElement('meta');
      description.setAttribute('name', 'description');
      document.head.appendChild(description);
    }
    description.setAttribute('content', meta_description);

    let ogDescription = document.querySelector("meta[property='og:description']");
    if (!ogDescription) {
      ogDescription = document.createElement('meta');
      ogDescription.setAttribute('property', 'og:description');
      document.head.appendChild(ogDescription);
    }
    ogDescription.setAttribute('content', meta_description);
  }

  if (meta_keywords) {
    let keywords = document.querySelector("meta[name='keywords']");
    if (!keywords) {
      keywords = document.createElement('meta');
      keywords.setAttribute('name', 'keywords');
      document.head.appendChild(keywords);
    }
    keywords.setAttribute('content', meta_keywords);
  }
}

export function formatNumber1(num) {
    if (num == null || num === '') return '0';

    let [integerPart, decimalPart] = num.toString().split('.');
    let lastThree = integerPart.slice(-3);
    let otherDigits = integerPart.slice(0, -3);

    if (otherDigits !== '') {
        lastThree = ',' + lastThree;
    }

    let indianFormatted = otherDigits.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + lastThree;

    if (decimalPart) {
        indianFormatted += '.' + decimalPart;
    }

    return indianFormatted;
}

const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return date.toLocaleDateString('en-US', options);
};
const setNum = (number) => {
    return Number(number).toLocaleString('en-IN');
};
const generateOrderItemsTable = (selectedPlants, plants) => {
    let html = `
      <table class="dbTable">
        <tr class="dbTr dbTdHd">
          <td class="dbTd">#</td>
          <td class="dbTd">Name</td>
          <td class="dbTd">Type</td>
          <td class="dbTd">Qty</td>
          <td class="dbTd">Price</td>
          <td class="dbTd">Total</td>
        </tr>
    `;
  
    let n = 1;
    let total_qty = 0;
    let total_price = 0;
  
    Object.values(selectedPlants).forEach((plant) => {
      const plantData = plants.find((p) => p.$id === plant.plant_id) || {};
      const fruit_url = `https://cafnursery.in/product/${plantData.url || ''}`;
      const fruit_details = [
        { name: 'Seedling 1 Yr', qty: plant.variants.seedling_1yr?.quantity || 0, price: plant.variants.seedling_1yr?.price || 0 },
        { name: 'Seedling 2 Yr', qty: plant.variants.seedling_2yr?.quantity || 0, price: plant.variants.seedling_2yr?.price || 0 },
        { name: 'Seedling 3 Yr', qty: plant.variants.seedling_3yr?.quantity || 0, price: plant.variants.seedling_3yr?.price || 0 },
        { name: 'Root Stock 1 Yr', qty: plant.variants.rootstock_1yr?.quantity || 0, price: plant.variants.rootstock_1yr?.price || 0 },
        { name: 'Root Stock 2 Yr', qty: plant.variants.rootstock_2yr?.quantity || 0, price: plant.variants.rootstock_2yr?.price || 0 },
        { name: 'Root Stock 3 Yr', qty: plant.variants.rootstock_3yr?.quantity || 0, price: plant.variants.rootstock_3yr?.price || 0 },
      ];
  
      const row_count = fruit_details.filter((detail) => detail.qty > 0).length;
  
      if (row_count > 0) {
        html += `
          <tr class='dbTr'>
            <td class='dbTd' rowspan='${row_count}'>${n}</td>
            <td class='dbTd dbTdMain' rowspan='${row_count}'>
              <span>${plant.plant_category}</span>
              <a target='_blank' href='${fruit_url}' class='dbLink'>${plant.plant_name}</a>
            </td>
        `;
  
        let is_first_row = true;
        fruit_details.forEach((detail) => {
          if (detail.qty > 0) {
            if (!is_first_row) {
              html += `<tr class='dTr'>`;
            }
            const total_row_price = detail.qty * detail.price;
            total_qty += detail.qty;
            total_price += total_row_price;
  
            html += `
              <td class='dbTd'>${detail.name}</td>
              <td class='dbTd'>${detail.qty}</td>
              <td class='dbTd'>${detail.price}</td>
              <td class='dbTd'>${setNum(total_row_price)}</td>
            </tr>
            `;
  
            is_first_row = false;
          }
        });
        n++;
      }
    });
  
    html += `
      <tr class='dbTr ttl'>
        <td class='dbTd'></td>
        <td class='dbTd' colspan='2'>Total</td>
        <td class='dbTd'>${total_qty}</td>
        <td class='dbTd price' colspan='2'>₹ ${setNum(total_price)}</td>
      </tr>
    </table>
    `;
  
    return html;
};

export const generateOrderEmailHtml = (customer, selectedPlants, oid, orderDate, plants) => {
    const order_table = generateOrderItemsTable(selectedPlants, plants);
    const total = Object.values(selectedPlants).reduce(
      (total, plant) =>
        total +
        Object.values(plant.variants).reduce((sub, v) => sub + (v.quantity * v.price || 0), 0),
      0
    );
  
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta content="IE=edge" http-equiv="X-UA-Compatible">
        <meta content="width=device-width, initial-scale=1" name="viewport">
        <style>
          * {
            padding: 0;
            margin: 0;
            box-sizing: border-box;
            font-family: arial;
          }
          .body {
            padding: 50px 5px;
            background-color: #f4f7ff;
          }
          .bodyContainer {
            background: #fff;
            padding: 30px 15px;
            box-shadow: 0 4px 10px rgba(99, 99, 99, .1);
            margin: 20px auto;
            width: 95%;
            max-width: 600px;
            border-radius: 10px;
          }
          .messageTxt {
            font-size: 118%;
            color: #3d3d3d;
          }
          .messageHead {
            font-size: 150%;
            color: #3d3d3d;
            font-weight: 700;
            margin-bottom: 10px;
          }
          .bottomCredit {
            font-size: 85%;
            text-align: center;
            color: #5c5c5c;
          }
          a {
            text-decoration: none;
            color: #141414;
          }
          .flex {
            display: flex;
            align-items: center;
            justify-content: space-between;
          }
          .link {
            text-decoration: none;
            background-color: #317E60;
            padding: 14px;
            border-radius: 10px;
            text-align: center;
            width: 50%;
            display: block;
            margin: 20px auto;
            font-size: 110%;
            color: #fff;
            border: none;
            outline: 0;
            cursor: pointer;
          }
          .table {
            width: 100%;
            border-collapse: collapse;
            color: #3d3d3d;
            font-size: 105%;
          }
          .booking_detail_div {
            margin: 15px auto;
            border: 1px solid #eee;
            padding: 12px;
            border-radius: 8px;
          }
          .pd_head {
            font-weight: 700;
            font-size: 125%;
            color: #3d3d3d;
            margin-bottom: 7px;
          }
          .td {
            padding: 4px 0;
          }
          .td.right {
            margin-left: 5px;
            font-weight: 700;
            width: 65%;
            position: relative;
          }
          .div2 {
            border: none;
            background-color: rgba(14, 38, 26, .06);
            padding: 15px 12px;
          }
          .link2 {
            width: 40%;
            text-transform: uppercase;
            border-style: solid;
            margin-bottom: 0;
            margin-top: 10px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
          }
          td {
            border: 1px solid #ccc;
            padding: 10px;
            font-size: 80%;
          }
          tr.dbTdHd td, tr.ttl td {
            font-weight: bold;
          }
          td.price {
            text-align: center;
          }
          .dbTdMain span {
            font-size: 75%;
            display: inline-block;
            border: 1px solid #a7a7a7;
            padding: 2px 6px;
            border-radius: 20px;
            text-transform: capitalize;
          }
          .dbTdMain a {
            margin-top: 5px;
            display: block;
          }
        </style>
      </head>
      <body>
        <div class="body">
          <center>
            <img src="https://i.postimg.cc/8CGWDHNW/icon.png" height="80px" style="margin:15px 0" />
          </center>
          <div class="bodyContainer">
            <div class="flex">
              <div>
                <p class="messageHead">Dear ${customer.name},</p><br>
                <p class="messageTxt">
                  We're pleased to inform you that we have received your booking request. We're working on it.<br><br><br>
                  <strong>Booking Details: </strong><br><br>
                  Booking #: ${oid}<br>
                  Booking Date: ${formatDateTime(orderDate)}<br>
                  Total Cost: ₹ ${setNum(total)}/-<br><br>
                  Name: ${customer.name}<br>
                  Email: ${customer.email}<br>
                  Phone: ${customer.phone}<br>
                  Address: ${customer.address}
                </p>
              </div>
            </div>
            <br><br>
            ${order_table}
            <br><br><br><br><br>
            <p class="messageTxt">Sahil Chauhan<br>Farmer | Founder</p>
          </div>
          <p class="bottomCredit">
            Copyright &copy; 2024. All rights reserved.<br />
            <a href="tel:+917018703116">+91 70187 03116</a>
          </p>
        </div>
      </body>
      </html>
    `;
};

export function generateID() {
  let digits = '0123456789';
  let ID = '';
  for (let i = 0; i < 12; i++ ) {
      ID += digits[Math.floor(Math.random() * 10)];
  }
  return ID;
}

/**
 * Converts JSON data to CSV format
 * @param {Array} data - Array of objects to convert
 * @returns {string} CSV formatted string
 */
export function jsonToCSV(data) {
  if (!data || data.length === 0) {
    return '';
  }

  // Get all unique keys from all objects
  const allKeys = new Set();
  data.forEach(item => {
    Object.keys(item).forEach(key => allKeys.add(key));
  });

  const headers = Array.from(allKeys);

  // Helper function to escape CSV values
  const escapeCSVValue = (value) => {
    if (value === null || value === undefined) {
      return '';
    }

    // Convert arrays and objects to JSON strings
    if (typeof value === 'object') {
      value = JSON.stringify(value);
    }

    // Convert to string
    value = String(value);

    // Escape double quotes and wrap in quotes if contains comma, newline, or quote
    if (value.includes(',') || value.includes('\n') || value.includes('"')) {
      value = '"' + value.replace(/"/g, '""') + '"';
    }

    return value;
  };

  // Create CSV header
  const csvHeader = headers.map(escapeCSVValue).join(',');

  // Create CSV rows
  const csvRows = data.map(item => {
    return headers.map(header => escapeCSVValue(item[header])).join(',');
  });

  return [csvHeader, ...csvRows].join('\n');
}

/**
 * Downloads data as CSV file
 * @param {Array} data - Array of objects to export
 * @param {string} filename - Name of the file to download
 */
export function downloadCSV(data, filename = 'export.csv') {
  const csv = jsonToCSV(data);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');

  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}
