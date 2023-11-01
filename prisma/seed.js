
import { PrismaClient } from "@prisma/client";

let db = new PrismaClient();

async function seedArticles() {
    const articles = getArticles();
    await Promise.all(articles.map(article => {
         //wait for half a second
         Promise.resolve(setTimeout(() => {}, 500)).then(() => {
        return db.article.create({ data: article })
    })
    console.log('Articles seeded');
    }));
}

async function seedProfiles() {
    const profiles = getProfiles();
    await Promise.all(profiles.map(profile => {
        //wait for half a second
        Promise.resolve(setTimeout(() => {}, 500)).then(() => {
        db.profile.create({ data: profile })
    })
}));
    console.log('Profiles seeded');
}

async function seedLocations() {
    const locations = getLocations();
    await Promise.all(locations.map(location => db.location.create({ data: location })));
    console.log('Locations seeded');
}

function seedCategories() {
    const categories = [
        'Rock',
        'Metal',
        'Pop',
        'Hip-Hop',
        'Jazz',
        'Classical',
        'Country',
        'Folk',
        'Blues',
        'Electronic',
        'Reggae',
        'R&B',
        'Soul',
        'Latin',
        'Funk',
        'World',
        'Punk',
        'Gospel',
        'New Age',
        'Other'
    ];

    for (let i = 0; i < categories.length; i++) {
        db.category.create({
            data: {
                name: categories[i]
            }
        });
    }

    console.log('Categories seeded');
}


// seedLocations();
seedArticles();

// seedCategories();


function getLocations() {
    return [
        {
            "name": "New York City",
            "latitude": 40.7128,
            "longitude": 74.0060
        },
        {
            "name": "Los Angeles",
            "latitude": 34.0522,
            "longitude": 118.2437
        },
        {
            "name": "San Francisco",
            "latitude": 37.7749,
            "longitude": 122.4194
        },
        {
            "name": "Chicago",
            "latitude": 41.8781,
            "longitude": 87.6298
        },
        {
            "name": "Seattle",
            "latitude": 47.6062,
            "longitude": 122.3321
        },
        {
            "name": "Miami",
            "latitude": 25.7617,
            "longitude": 80.1918
        },
        {
            "name": "London",
            "latitude": 51.5074,
            "longitude": 0.1278
        },
        {
            "name": "Paris",
            "latitude": 48.8566,
            "longitude": 2.3522
        },
        {
            "name": "Berlin",
            "latitude": 52.5200,
            "longitude": 13.4050
        },
        {
            "name": "Tokyo",
            "latitude": 35.6762,
            "longitude": 139.6503
        },
        {
            "name": "Sydney",
            "latitude": 33.8688,
            "longitude": 151.2093
        },
        {
            "name": "Rio de Janeiro",
            "latitude": -22.9068,
            "longitude": -43.1729
        },
        {
            "name": "Cape Town",
            "latitude": -33.9249,
            "longitude": 18.4241
        },
        {
            "name": "Moscow",
            "latitude": 55.7558,
            "longitude": 37.6173
        },
        {
            "name": "Beijing",
            "latitude": 39.9042,
            "longitude": 116.4074
        },
        {
            "name": "Mumbai",
            "latitude": 19.0760,
            "longitude": 72.8777
        }
    ]
}

function getArticles() {
    return [
        {
          "title": "Rock'n'Roll Fashion: The Evolution of Style in Music History",
          "content": "Dive into the fashion trends that have defined rock'n'roll through the decades. From leather jackets to band t-shirts, we'll explore how rock fashion has become a symbol of rebellion and self-expression.",
          "eventTime": null,
          "writer": {
            "connect": {
              "id": 4
            }
          },
          "location": {
            "connect": {
              "id": 4
            }
          },
            "category": {
                "connect": {
                "id": 2
                }
            }
        },
        {
            "title": "The Power of Metal: Unleashing the Fury of Shredding Guitars",
            "content": "Dive into the world of metal music and explore the mind-blowing guitar solos that define the genre. From the virtuosos of thrash to the heavyweights of doom metal, we'll journey through the sonic realms of metal.",
            "eventTime": null,
            "writer": {
              "connect": {
                "id": 1
              }
            },
            "location": {
              "connect": {
                "id": 1
              }
            },
            "category": {
                "connect": {
                "id": 3
                }
            }
          },
          {
            "title": "Metal Revolution: The Evolution of Subgenres and Brutal Vocals",
            "content": "Discover the relentless evolution of metal subgenres and the thunderous vocal styles that command the genre. From death growls to black metal shrieks, we'll delve into the diversity of metal's sonic landscape.",
            "eventTime": null,
            "writer": {
              "connect": {
                "id": 2
              }
            },
            "location": {
              "connect": {
                "id": 12
              }
            },
            "category": {
                "connect": {
                "id": 4
                }
            }
          },
          {
            "title": "From Garage to Glory: The Origins of Metal Bands",
            "content": "Take a journey to the beginnings of legendary metal bands and how they rose from garage jam sessions to worldwide acclaim. From Metallica to Iron Maiden, we'll explore their humble origins and meteoric rise.",
            "eventTime": null,
            "writer": {
              "connect": {
                "id": 3
              }
            },
            "location": {
              "connect": {
                "id": 13
              }
            },
            "category": {
                "connect": {
                "id": 1
                }
            }
          },
          {
            "title": "Metalhead's Paradise: A Guide to Iconic Metal Festivals",
            "content": "Immerse yourself in the world of metal festivals and mosh pits. From Wacken Open Air to Hellfest, we'll guide you through the top metal gatherings that celebrate the culture, music, and camaraderie of metalheads.",
            "eventTime": null,
            "writer": {
              "connect": {
                "id": 4
              }
            },
            "location": {
              "connect": {
                "id": 14
              }
            },
            "category": {
                "connect": {
                "id": 2
                }
            }
          }
      ]
}

function getProfiles() {
    return [
        {
          "name": "Alice Johnson",
          "email": "alice@example.com",
          "role": "Writer",
          "profilePicture": "alice.jpg",
          "performerId": null,
          "locationId": null
        },
        {
          "name": "Bob Smith",
          "email": "bob@example.com",
          "role": "Writer",
          "profilePicture": "bob.jpg",
          "performerId": null,
          "locationId": null
        },
        {
          "name": "Charlie Brown",
          "email": "charlie@example.com",
          "role": "Writer",
          "profilePicture": "charlie.jpg",
          "performerId": null,
          "locationId": null
        },
        {
          "name": "David White",
          "email": "david@example.com",
          "role": "Writer",
          "profilePicture": "david.jpg",
          "performerId": null,
          "locationId": null
        },
        {
          "name": "Eve Davis",
          "email": "eve@example.com",
          "role": "Writer",
          "profilePicture": "eve.jpg",
          "performerId": null,
          "locationId": null
        }
      ]
}