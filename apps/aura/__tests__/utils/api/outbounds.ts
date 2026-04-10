import { Verifications } from '@/api/auranode.service';
import { getAuraVerification } from '@/hooks/useParseBrightIdVerificationData';
import { EvaluationCategory } from '@/types/dashboard';
import { calculateImpact } from '@/utils/score';

export const generateOutboundEvaluationConnection = (
  fromBright: { id: string },
  toBright: { id: string; verifications: Verifications },
  evaluationCategory: EvaluationCategory,
  score: number,
  rating: number,
) => {
  const verifications = getAuraVerification(
    toBright.verifications,
    evaluationCategory,
  );

  if (!verifications)
    throw new Error('Verifications must exist in the brightid profile');

  const impact = calculateImpact(score, rating);

  verifications.score += impact;

  verifications.impacts.push({
    confidence: rating,
    evaluator: fromBright.id,
    impact,
    score,
    level: 1,
    modified: Date.now(),
  });

  return {
    id: toBright.id,
    level: 'aura only' as ConnectionLevel,
    reportReason: null,
    timestamp: 1601240998431,
    verifications: toBright.verifications,
  };
};

export const outboundEvaluationsSampleData = {
  data: {
    connections: [
      {
        id: 'IdtXRbzTU7eDK4RRXtT74ggL_n3cD5Fz87dD8enrJw0',
        level: 'already known',
        reportReason: null,
        timestamp: 1554029439631,
        verifications: [
          {
            name: 'SeedConnected',
            rank: 1,
            connected: ['Pr5SHCQkGvSc'],
            communities: ['Pr5SHCQkGvSc'],
            reported: [],
            block: 30173280,
            timestamp: 1740433832835,
            hash: 'gBCMvLozaHajwXY7ixeaGRhRzjG2EQZhOjgi--adoFQ',
          },
          {
            name: 'BrightID',
            block: 30173280,
            timestamp: 1740433855220,
            hash: 'Hf-BVEx8lPMLT1jsoVzMGVTUbm-XSVwUbJSSeTrV7XQ',
          },
          {
            name: 'Bitu',
            releaseTime: 1653882066611,
            linksNum: 9,
            confirmedScore: 7,
            directReports: {},
            indirectReports: {
              TUnr9EjYPpUITRR3k5my7aGWghdv_Hdi3jVv15P1N3k: -2,
            },
            reportedConnections: {
              TUnr9EjYPpUITRR3k5my7aGWghdv_Hdi3jVv15P1N3k: [
                'x8D-HX9bljRsxu0mWkVzMOJlyHmffQvnPrG9I-HTJbQ',
                'frLHtQ0nk-vgd99BAK9y-PLnN0UsO3FPrNs-Db-i9K8',
              ],
            },
            score: 0,
            block: 30173280,
            timestamp: 1740433875243,
            hash: '_G9d71Ss-Ff3zaZ-biJFJIdgtP5cEpIcE3sLz0WDDd4',
          },
        ],
      },
      {
        id: '8CjGM1-1Yl2GiezTt7Htiz16RJaLkljhQt-2PZjLoSE',
        level: 'just met',
        reportReason: null,
        timestamp: 1600712533555,
        verifications: [
          {
            name: 'SeedConnected',
            rank: 1,
            connected: ['Pr5SHCQkGvSc'],
            communities: ['Pr5SHCQkGvSc'],
            reported: [],
            block: 30173280,
            timestamp: 1740433832834,
            hash: 'ZeP7TzfJW-UFj6kQsOThJTXFPsOJyRGtXwR8GSmCjEQ',
          },
          {
            name: 'BrightID',
            block: 30173280,
            timestamp: 1740433855220,
            hash: '_U6qjrcPM0tT0XEh6va-nDUu8D061slGdDrJj3f8Z2w',
          },
        ],
      },
      {
        id: 'fK01g8nk3PqOBidMoYj3EiJxfb2Xqdz6fI3bTBWqYFA',
        level: 'just met',
        reportReason: null,
        timestamp: 1600712543086,
        verifications: [
          {
            name: 'SeedConnected',
            rank: 1,
            connected: ['Pr5SHCQkGvSc'],
            communities: ['Pr5SHCQkGvSc'],
            reported: [],
            block: 30173280,
            timestamp: 1740433832836,
            hash: 'NBnTX-WypmFX__NQ4m8All2d8tH7RwN3H5VzwmNW95o',
          },
          {
            name: 'BrightID',
            block: 30173280,
            timestamp: 1740433855221,
            hash: 'mpEFNIsOz3V6vZEGjo_N25aj_bAV_b3Iq7rpBQVTYUI',
          },
        ],
      },
      {
        id: 'EFVDSHsKfbVKyFCDPdM0vgCdwAL92-g6nz-sKBBcCLY',
        level: 'just met',
        reportReason: null,
        timestamp: 1600712575951,
        verifications: [
          {
            name: 'Seed',
            block: 30173280,
            timestamp: 1740433826885,
            hash: 'viWTfIf9-V8OMmDus751eGQFlpiEYF4zN-gjvohfHxU',
          },
          {
            name: 'SeedConnected',
            rank: 1,
            connected: ['Pr5SHCQkGvSc'],
            communities: ['Pr5SHCQkGvSc'],
            reported: [],
            block: 30173280,
            timestamp: 1740433832834,
            hash: 'ttmL00gYJBCv9W6v6lELHdsJRLNxeRAL6KW-hOKE3Y4',
          },
          {
            name: 'SeedConnectedWithFriend',
            friend: null,
            block: 30173280,
            timestamp: 1740433850176,
            hash: 'PXKZBgQz482PS2LBcSn6Ss_6WIfAvrjIcUiOK-PYqGM',
          },
          {
            name: 'BrightID',
            block: 30173280,
            timestamp: 1740433855220,
            hash: 'VTEEiORp8dtD9vK7q-tj4K_3TgpZtZe_iLv5vV1cuco',
          },
          {
            name: 'Bitu',
            releaseTime: 1653882066611,
            linksNum: 2,
            confirmedScore: 2,
            directReports: {},
            indirectReports: {},
            reportedConnections: {},
            score: 0,
            block: 30173280,
            timestamp: 1740433875246,
            hash: 'oiIS8YK07SEmsLtJF5CEqLxdXEzFBmIBuchct5yObz4',
          },
        ],
      },
      {
        id: '9PzSHUJwoED66VlWd81EO17zoidTJjRS1pa_JW9E4OI',
        level: 'just met',
        reportReason: null,
        timestamp: 1600712586438,
        verifications: [
          {
            name: 'SeedConnected',
            rank: 1,
            connected: ['Pr5SHCQkGvSc'],
            communities: ['Pr5SHCQkGvSc'],
            reported: [],
            block: 30173280,
            timestamp: 1740433832835,
            hash: 'FDYa12wJWmKgbyMW4Ft9y3h5oFF8XUCE_KDVA01YzHo',
          },
          {
            name: 'BrightID',
            block: 30173280,
            timestamp: 1740433855220,
            hash: 'J3ULC7P2qfesKamCE1M0-B7uGa8CrSQOjfIjyUQXWis',
          },
        ],
      },
      {
        id: 'rhNu4wcsxqqQoRvFim25XJNk7iZ7n9jaWEwkpep7O6U',
        level: 'just met',
        reportReason: null,
        timestamp: 1600712666065,
        verifications: [
          {
            name: 'SeedConnected',
            rank: -3,
            connected: [
              'Pr5SHCQkGvSc',
              'sVYW_wqVAxaoT2K1Va9duLjQ1jmgnUuvVP82bPDrAL8',
              'ufl4PdK91Qf_1Efb61chYN6Sa6BZjU8mjPSqBbrDhDk',
            ],
            communities: [
              'Pr5SHCQkGvSc',
              'sVYW_wqVAxaoT2K1Va9duLjQ1jmgnUuvVP82bPDrAL8',
              'ufl4PdK91Qf_1Efb61chYN6Sa6BZjU8mjPSqBbrDhDk',
            ],
            reported: [
              'Pr5SHCQkGvSc',
              'Tf6Wtwlhjy3gydBvGsdPgVH0ttZXM-SOeFZIZePvZdg',
            ],
            block: 30173280,
            timestamp: 1740433832834,
            hash: 'if2ALWOQ6SchhdLVcl7FKj_wIL3VmazF2pB0ZMSAvR4',
          },
        ],
      },
      {
        id: 'hVNPgrT0rAlkkOdhUAUzOIK47DoHEF7CdX4Cv-ZKv2A',
        level: 'just met',
        reportReason: null,
        timestamp: 1601241022575,
        verifications: [
          {
            name: 'SeedConnected',
            rank: 1,
            connected: ['Tf6Wtwlhjy3gydBvGsdPgVH0ttZXM-SOeFZIZePvZdg'],
            communities: ['Tf6Wtwlhjy3gydBvGsdPgVH0ttZXM-SOeFZIZePvZdg'],
            reported: [],
            block: 30173280,
            timestamp: 1740433832007,
            hash: 'F80Yc9pzAUNlPuKBfmVfYcjuD0br5INUpew5POw79RQ',
          },
          {
            name: 'BrightID',
            block: 30173280,
            timestamp: 1740433854495,
            hash: 'bXb61ZCNTglHbM5wtpJMwthI3gTaz8jkqtH3K9h4fVM',
          },
        ],
      },
      {
        id: 'ZD6l2Kxk95855K8nIQjhiTFYP4E5nZUE6IR-FN5V77o',
        level: 'just met',
        reportReason: null,
        timestamp: 1601241025749,
        verifications: [
          {
            name: 'SeedConnected',
            rank: 1,
            connected: ['w4dNg2yUSuuMN_SfPBmqTbdNhk_nsFgwoO36ZUcDt88'],
            communities: ['w4dNg2yUSuuMN_SfPBmqTbdNhk_nsFgwoO36ZUcDt88'],
            reported: [],
            block: 30173280,
            timestamp: 1740433832006,
            hash: 'segqr-nfaR6acraZ8VN0bdP-5mLVG6S8M5fwMJM6_5E',
          },
          {
            name: 'BrightID',
            block: 30173280,
            timestamp: 1740433854493,
            hash: '_3ECx0J3hrYkmjMjLbdq68P6D21aNld4MVBOIXWO-bg',
          },
        ],
      },
      {
        id: '17mPWbv1sENjTYAH_cAQtF_lqQ72drVWa5nL6FfOx4k',
        level: 'just met',
        reportReason: null,
        timestamp: 1601241038187,
        verifications: [
          {
            name: 'SeedConnected',
            rank: 1,
            connected: ['Tf6Wtwlhjy3gydBvGsdPgVH0ttZXM-SOeFZIZePvZdg'],
            communities: ['Tf6Wtwlhjy3gydBvGsdPgVH0ttZXM-SOeFZIZePvZdg'],
            reported: [],
            block: 30173280,
            timestamp: 1740433832007,
            hash: '3eoqYqVT0C9i18RDPCHA4wBCBmCs806Q0__QW28oBHk',
          },
          {
            name: 'BrightID',
            block: 30173280,
            timestamp: 1740433854495,
            hash: 'BkvdKHyl_pPU-a3eHDxX2X3IRjUnP6tH5LEmx9lcylU',
          },
        ],
      },
      {
        id: 'ansUpPGA_fQ64p_SrvFltRpYtRN3nODxntF023rTtqE',
        level: 'just met',
        reportReason: null,
        timestamp: 1601241023342,
        verifications: [
          {
            name: 'SeedConnected',
            rank: 1,
            connected: ['w4dNg2yUSuuMN_SfPBmqTbdNhk_nsFgwoO36ZUcDt88'],
            communities: ['w4dNg2yUSuuMN_SfPBmqTbdNhk_nsFgwoO36ZUcDt88'],
            reported: [],
            block: 30173280,
            timestamp: 1740433832006,
            hash: '-l5Or2RQuXSy0SNkAJcJelnSaYabfNQvjwg5h3rAaMg',
          },
          {
            name: 'BrightID',
            block: 30173280,
            timestamp: 1740433854493,
            hash: 'StZX6z4j-bgjDHXMdTZ7KTLyGxrT3TyRO6E2B6YYvRM',
          },
        ],
      },
      {
        id: 'uNAc-PXJpzoTX4dLmTKzwSfVVVY3hwvowpsbccWQTx4',
        level: 'just met',
        reportReason: null,
        timestamp: 1601241040454,
        verifications: [
          {
            name: 'SeedConnected',
            rank: 1,
            connected: ['oD8jAEuJx1NuNuZnb4AkHiJPtQDn0fIApyHjimFsS6I'],
            communities: ['oD8jAEuJx1NuNuZnb4AkHiJPtQDn0fIApyHjimFsS6I'],
            reported: [],
            block: 30173280,
            timestamp: 1740433832006,
            hash: 'k46F5g48KrlcsrHx_1KzYkjTP4sUOZO2qiV9JwmZW-U',
          },
          {
            name: 'BrightID',
            block: 30173280,
            timestamp: 1740433854493,
            hash: 'rClk8mekK0BbXV02yOrCQYfx09NDix-g0OE2yJKGcfk',
          },
        ],
      },
      {
        id: 'YVUovbLdNva__f5NbgAJlmYpkCmsK0qjgxHH1iqKFM0',
        level: 'just met',
        reportReason: null,
        timestamp: 1601241399193,
        verifications: [
          {
            name: 'SeedConnected',
            rank: 1,
            connected: ['w4dNg2yUSuuMN_SfPBmqTbdNhk_nsFgwoO36ZUcDt88'],
            communities: ['w4dNg2yUSuuMN_SfPBmqTbdNhk_nsFgwoO36ZUcDt88'],
            reported: [],
            block: 30173280,
            timestamp: 1740433832006,
            hash: '0LCtcNG_sOqMmOAHV4vKxchbuFF3oszqEjnf91cPOrg',
          },
          {
            name: 'BrightID',
            block: 30173280,
            timestamp: 1740433854493,
            hash: 'RCT3gi1U2lQVZmOmkFbjPn_T6CZ5QbTgh00foow8aMs',
          },
        ],
      },
      {
        id: 'MDSS4Xtccyq5l_-mc5dg0RZtqQugQyF8O-y_lQrEbPM',
        level: 'just met',
        reportReason: null,
        timestamp: 1601241399548,
        verifications: [
          {
            name: 'SeedConnected',
            rank: 1,
            connected: ['w4dNg2yUSuuMN_SfPBmqTbdNhk_nsFgwoO36ZUcDt88'],
            communities: ['w4dNg2yUSuuMN_SfPBmqTbdNhk_nsFgwoO36ZUcDt88'],
            reported: [],
            block: 30173280,
            timestamp: 1740433832006,
            hash: 'bXlWm2u1r51VeDwkBhaXD-r_O0Sq4J5XwYZGrsdfrDc',
          },
          {
            name: 'BrightID',
            block: 30173280,
            timestamp: 1740433854493,
            hash: 'XV1dbAFvo48aVUQS0yL842ZF6RWB8IO0i8kBHR1m7Lg',
          },
        ],
      },
      {
        id: 'vCmCMlazIB9OvHJIjlpz6JSBC8VR-arBgryDy6H_dzE',
        level: 'just met',
        reportReason: null,
        timestamp: 1601241024139,
        verifications: [
          {
            name: 'SeedConnected',
            rank: 1,
            connected: ['oD8jAEuJx1NuNuZnb4AkHiJPtQDn0fIApyHjimFsS6I'],
            communities: ['oD8jAEuJx1NuNuZnb4AkHiJPtQDn0fIApyHjimFsS6I'],
            reported: [],
            block: 30173280,
            timestamp: 1740433832006,
            hash: 'Jtuv1-RKg_pwwItVINA-pMHAF58_-AKMdg7abqDzZMk',
          },
          {
            name: 'BrightID',
            block: 30173280,
            timestamp: 1740433854493,
            hash: 'NJY95zmFTiO4NZ6_F3PqqrfqPPl9fsbWi4GPARHspXU',
          },
        ],
      },
      {
        id: 'Jwln63V7pW5fv99dImkR5K2dWKj0olI7pshW5NdBGEY',
        level: 'just met',
        reportReason: null,
        timestamp: 1601242143298,
        verifications: [
          {
            name: 'SeedConnected',
            rank: 1,
            connected: ['oD8jAEuJx1NuNuZnb4AkHiJPtQDn0fIApyHjimFsS6I'],
            communities: ['oD8jAEuJx1NuNuZnb4AkHiJPtQDn0fIApyHjimFsS6I'],
            reported: [],
            block: 30173280,
            timestamp: 1740433832006,
            hash: 'kuruB5mRkTxM_WTKrWZkYgBS8Xl_l7q4lwcKPvgGpPY',
          },
          {
            name: 'BrightID',
            block: 30173280,
            timestamp: 1740433854493,
            hash: 'h5WsX7UCIv1URLnF4rjZiQ--oTlYTsfAIXl8a221EMQ',
          },
        ],
      },
      {
        id: '1joXU1oePWZYfEE9AbSRKQ5pnHGAgFFShaNf90bvfoU',
        level: 'just met',
        reportReason: null,
        timestamp: 1601242153629,
        verifications: [
          {
            name: 'SeedConnected',
            rank: 1,
            connected: ['w4dNg2yUSuuMN_SfPBmqTbdNhk_nsFgwoO36ZUcDt88'],
            communities: ['w4dNg2yUSuuMN_SfPBmqTbdNhk_nsFgwoO36ZUcDt88'],
            reported: [],
            block: 30173280,
            timestamp: 1740433832006,
            hash: 'LXJuGW5oWNxpaSbjoL8GuXtWhaVsaNZOlZ7gWMVNW8c',
          },
          {
            name: 'BrightID',
            block: 30173280,
            timestamp: 1740433854493,
            hash: 'cZQj5mMkBA5id6CC7HlVvvTOqifiuRzeW-E7sHTHD7U',
          },
        ],
      },
      {
        id: '4nAV23b2hGuIc-KZpCn_z5aufCIMSIVkNgNgENtM3bk',
        level: 'just met',
        reportReason: null,
        timestamp: 1601242144856,
        verifications: [
          {
            name: 'SeedConnected',
            rank: 1,
            connected: ['w4dNg2yUSuuMN_SfPBmqTbdNhk_nsFgwoO36ZUcDt88'],
            communities: ['w4dNg2yUSuuMN_SfPBmqTbdNhk_nsFgwoO36ZUcDt88'],
            reported: [],
            block: 30173280,
            timestamp: 1740433832006,
            hash: '86O5OiinWKD2yIzFFJh058urP6Y5Y6L0cRzn6DJGhQ8',
          },
          {
            name: 'BrightID',
            block: 30173280,
            timestamp: 1740433854493,
            hash: 'H5SxbqlO0ht34HKP46vWs2gwSzuoyiz1ImpaS-xTt1Q',
          },
        ],
      },
      {
        id: '-oZ6DYUiZxwQzOZtUw2E4QJ44NFztDAov26r7CVTkzg',
        level: 'just met',
        reportReason: null,
        timestamp: 1601242156958,
        verifications: [
          {
            name: 'SeedConnected',
            rank: 1,
            connected: ['w4dNg2yUSuuMN_SfPBmqTbdNhk_nsFgwoO36ZUcDt88'],
            communities: ['w4dNg2yUSuuMN_SfPBmqTbdNhk_nsFgwoO36ZUcDt88'],
            reported: [],
            block: 30173280,
            timestamp: 1740433832005,
            hash: 'CCRhoFsf8C4TkhtOoW61RSdTHPnLrGagS7OVP2a2c-k',
          },
          {
            name: 'BrightID',
            block: 30173280,
            timestamp: 1740433854493,
            hash: '7SHhclIBNATP-6qDpKM28QVHv7i4n_wEBZAMabr6pV8',
          },
        ],
      },
      {
        id: 'WJzkhJVskaiAe6le9CngzNGs9aXbuyLEr0XMr9NFpFI',
        level: 'just met',
        reportReason: null,
        timestamp: 1601242157928,
        verifications: [
          {
            name: 'SeedConnected',
            rank: 1,
            connected: ['oD8jAEuJx1NuNuZnb4AkHiJPtQDn0fIApyHjimFsS6I'],
            communities: ['oD8jAEuJx1NuNuZnb4AkHiJPtQDn0fIApyHjimFsS6I'],
            reported: [],
            block: 30173280,
            timestamp: 1740433832006,
            hash: '_AyosWoYtzmTp76TGqVF_O7oILaJ64DB5WLraKsLkQU',
          },
          {
            name: 'BrightID',
            block: 30173280,
            timestamp: 1740433854493,
            hash: 'rx9uliatCURg0fbsXkB6kvOp1CBdbQu_oOeHtZvGiKY',
          },
        ],
      },
      {
        id: '2R3F47LIjbBMtQUk3F7tJrGrbnYXuJ3QQ27BsT7BLNY',
        level: 'just met',
        reportReason: null,
        timestamp: 1601242157625,
        verifications: [
          {
            name: 'Aura',
            block: 30173280,
            timestamp: 1740433826802,
            domains: [
              {
                name: 'BrightID',
                categories: [
                  {
                    name: 'player',
                    score: 0,
                    level: 0,
                    impacts: [
                      {
                        evaluator:
                          'k0Q21vCvPM2zqeXaexd4RGb0NCjMC32mNJQC-iediYs',
                        level: null,
                        score: null,
                        confidence: 1,
                        impact: 0,
                      },
                    ],
                  },
                  {
                    name: 'subject',
                    score: 0,
                    level: 0,
                    impacts: [
                      {
                        evaluator:
                          'k0Q21vCvPM2zqeXaexd4RGb0NCjMC32mNJQC-iediYs',
                        level: 0,
                        score: 0,
                        confidence: 4,
                        impact: 0,
                      },
                    ],
                  },
                ],
              },
            ],
          },
          {
            name: 'SeedConnected',
            rank: 3,
            connected: [
              'w4dNg2yUSuuMN_SfPBmqTbdNhk_nsFgwoO36ZUcDt88',
              '---U49atc2d-z0HFP_0-qeml3rsj_I7Nsd7QA5aP7mc',
              'vPmP-pkagrl02LrGgIaFf4aimR4rTrbnIcYT5t7q2w4',
            ],
            communities: [
              'w4dNg2yUSuuMN_SfPBmqTbdNhk_nsFgwoO36ZUcDt88',
              '---U49atc2d-z0HFP_0-qeml3rsj_I7Nsd7QA5aP7mc',
              'vPmP-pkagrl02LrGgIaFf4aimR4rTrbnIcYT5t7q2w4',
            ],
            reported: [],
            block: 30173280,
            timestamp: 1740433832006,
            hash: 'KhjoEtEmFtG5dmPJvGAp7DHaEph7emKjgOYbM_W0Zcc',
          },
          {
            name: 'BrightID',
            block: 30173280,
            timestamp: 1740433854493,
            hash: '71IIC1gmhGnnHZU7Jl8CUWGJmXU7gw9_DNBFt8CwN0g',
          },
        ],
      },
      {
        id: 'L_HYk7qbHaeBTyLdf1Xo213dbkqvIeWvhEqJdaTQLvM',
        level: 'just met',
        reportReason: null,
        timestamp: 1601242163253,
        verifications: [
          {
            name: 'SeedConnected',
            rank: 1,
            connected: ['w4dNg2yUSuuMN_SfPBmqTbdNhk_nsFgwoO36ZUcDt88'],
            communities: ['w4dNg2yUSuuMN_SfPBmqTbdNhk_nsFgwoO36ZUcDt88'],
            reported: [],
            block: 30173280,
            timestamp: 1740433832006,
            hash: 'vwGTveL-KhhckZJn3ObhZcqD81BNi7a4jTmOGvBVNYk',
          },
          {
            name: 'BrightID',
            block: 30173280,
            timestamp: 1740433854493,
            hash: 'Hv4v3WYYFdSXxSg41-DtftZDBKME3ONa_1rruqwady0',
          },
        ],
      },
      {
        id: 'wZplNhTjcyK0f_4KAn8WQFCIOVVcH9vpTks8hNXdkK0',
        level: 'just met',
        reportReason: null,
        timestamp: 1601242304144,
        verifications: [
          {
            name: 'SeedConnected',
            rank: 1,
            connected: ['w4dNg2yUSuuMN_SfPBmqTbdNhk_nsFgwoO36ZUcDt88'],
            communities: ['w4dNg2yUSuuMN_SfPBmqTbdNhk_nsFgwoO36ZUcDt88'],
            reported: [],
            block: 30173280,
            timestamp: 1740433832006,
            hash: 'ENZK85uMnmjCjCG6GUYzBA5nAb-pfXxQeq9eDPe-Vxk',
          },
          {
            name: 'BrightID',
            block: 30173280,
            timestamp: 1740433854493,
            hash: 'DW57a561dqVosXIaagcUXA8VIIKBFk_BBFOatq7Xg7M',
          },
        ],
      },
      {
        id: 'jOeM_mUCic8uj2ol93UPKktZwSrmoBhi0eVr0FkIWX8',
        level: 'just met',
        reportReason: null,
        timestamp: 1601242154398,
        verifications: [
          {
            name: 'SeedConnected',
            rank: 1,
            connected: ['oD8jAEuJx1NuNuZnb4AkHiJPtQDn0fIApyHjimFsS6I'],
            communities: ['oD8jAEuJx1NuNuZnb4AkHiJPtQDn0fIApyHjimFsS6I'],
            reported: [],
            block: 30173280,
            timestamp: 1740433832006,
            hash: '23w8q2cZUxHxLFZfVv-zMfgbB1DgX_AmRana8zPXQdU',
          },
          {
            name: 'BrightID',
            block: 30173280,
            timestamp: 1740433854493,
            hash: 'IzwBeZxd9Am5F_Vd1XFqjP3PqNxa8r3mdO-lYRZFXiQ',
          },
        ],
      },
      {
        id: 'XAQlKXQ7connBgw-FGyszNOFJhe5ldnSb_GkSwemrwA',
        level: 'just met',
        reportReason: null,
        timestamp: 1601243419006,
        verifications: [
          {
            name: 'SeedConnected',
            rank: 1,
            connected: ['3vqWfpOxP2fR'],
            communities: ['3vqWfpOxP2fR'],
            reported: [],
            block: 30173280,
            timestamp: 1740433832006,
            hash: 'y-0pIyY9EGs64Y6iGvKi58ZStGbcc7RTYOm9e8dlELQ',
          },
          {
            name: 'BrightID',
            block: 30173280,
            timestamp: 1740433854493,
            hash: '8y9xcp7RN8OAgHknMuOh3l1RtbbnAZJaG3bLd5W5GV4',
          },
        ],
      },
      {
        id: 'xlk3VGkFvW6EzdNqBf44yopOdL4bfCmbEzzxjeraA1Q',
        level: 'just met',
        reportReason: null,
        timestamp: 1601243418203,
        verifications: [
          {
            name: 'SeedConnected',
            rank: 1,
            connected: ['3vqWfpOxP2fR'],
            communities: ['3vqWfpOxP2fR'],
            reported: [],
            block: 30173280,
            timestamp: 1740433832006,
            hash: 'qbplQIhl-3CAXAaV31HnDcrsSAYzwu-zDPl_Y2wuPFo',
          },
          {
            name: 'BrightID',
            block: 30173280,
            timestamp: 1740433854493,
            hash: '9-OgI9MUudVdErjVUUDj-NZs61fUvXBAMfRFC7DTBM8',
          },
        ],
      },
      {
        id: 'YBckrx4Tar0dWgkXsx_lYWjmokiKMmk9-CcsZenKeqk',
        level: 'just met',
        reportReason: null,
        timestamp: 1601243422812,
        verifications: [
          {
            name: 'SeedConnected',
            rank: 1,
            connected: ['3vqWfpOxP2fR'],
            communities: ['3vqWfpOxP2fR'],
            reported: [],
            block: 30173280,
            timestamp: 1740433832006,
            hash: 'ivxO3tWcIWo0XFpr0Ug2MCwrafDFkQlLTTeJWDDYMLc',
          },
          {
            name: 'BrightID',
            block: 30173280,
            timestamp: 1740433854493,
            hash: 'Du5Ho9r2wbKIE7k9F9X1NlMkpCHgxye7-zN5eexmqyY',
          },
        ],
      },
      {
        id: 'Kka2V4G6QX_9Fkgn_Z8QSNDSjru2re48z_WTimAkDv0',
        level: 'just met',
        reportReason: null,
        timestamp: 1601243419612,
        verifications: [
          {
            name: 'SeedConnected',
            rank: 1,
            connected: ['oD8jAEuJx1NuNuZnb4AkHiJPtQDn0fIApyHjimFsS6I'],
            communities: ['oD8jAEuJx1NuNuZnb4AkHiJPtQDn0fIApyHjimFsS6I'],
            reported: [],
            block: 30173280,
            timestamp: 1740433832853,
            hash: 'Dr5ilnQk2SB6XV_KdIp4yvYD-v3N6D8yX9mbCRaGjAc',
          },
          {
            name: 'BrightID',
            block: 30173280,
            timestamp: 1740433855235,
            hash: 'FolqAKRgIrvwCbzOW12xsrd6y7SdnigZxeY3f0E0lO0',
          },
        ],
      },
      {
        id: 'EvUUeAOeXlBTHkaJqDuhBxwXXynO2u5FtFWdLzJXcpY',
        level: 'just met',
        reportReason: null,
        timestamp: 1601243421191,
        verifications: [
          {
            name: 'SeedConnected',
            rank: 4,
            connected: [
              'w4dNg2yUSuuMN_SfPBmqTbdNhk_nsFgwoO36ZUcDt88',
              'PbtXC7NF5bhiyrDoCShlg3iKK3d9bto_uxg9B4BGv9E',
              '---U49atc2d-z0HFP_0-qeml3rsj_I7Nsd7QA5aP7mc',
              'ufl4PdK91Qf_1Efb61chYN6Sa6BZjU8mjPSqBbrDhDk',
            ],
            communities: [
              'w4dNg2yUSuuMN_SfPBmqTbdNhk_nsFgwoO36ZUcDt88',
              'PbtXC7NF5bhiyrDoCShlg3iKK3d9bto_uxg9B4BGv9E',
              '---U49atc2d-z0HFP_0-qeml3rsj_I7Nsd7QA5aP7mc',
              'ufl4PdK91Qf_1Efb61chYN6Sa6BZjU8mjPSqBbrDhDk',
            ],
            reported: [],
            block: 30173280,
            timestamp: 1740433832005,
            hash: '8-WcW4TYhPefnacLY57o48Hbh1i3T5F2jeqM9Hd9rOo',
          },
          {
            name: 'BrightID',
            block: 30173280,
            timestamp: 1740433854492,
            hash: 'Y2wXMTPkyi6wjzNTGl-p22aE8-JhKlHroZWTy9-mJYw',
          },
        ],
      },
      {
        id: 'TCbZbpMOctUq5HgCNefsN86pxP7pw0zLnq2kIpXNfGw',
        level: 'just met',
        reportReason: null,
        timestamp: 1601243423355,
        verifications: [
          {
            name: 'SeedConnected',
            rank: 1,
            connected: ['w4dNg2yUSuuMN_SfPBmqTbdNhk_nsFgwoO36ZUcDt88'],
            communities: ['w4dNg2yUSuuMN_SfPBmqTbdNhk_nsFgwoO36ZUcDt88'],
            reported: [],
            block: 30173280,
            timestamp: 1740433832006,
            hash: '2vt6Uuzni4Rr6x9iaEYOeQtfKsj6B0uG4HUVsDjwHV8',
          },
          {
            name: 'BrightID',
            block: 30173280,
            timestamp: 1740433854493,
            hash: '5M8hI7meeg_8EKSYF_Y13no6e4SqvyvCUlQxd5FLAh4',
          },
        ],
      },
      {
        id: 'bLDdhDnUFdyrA4H2EhOD6lnYaS6B3n2w8JeCk6MhsRU',
        level: 'just met',
        reportReason: null,
        timestamp: 1601243433734,
        verifications: [
          {
            name: 'Aura',
            block: 30173280,
            timestamp: 1740433826802,
            domains: [
              {
                name: 'BrightID',
                categories: [
                  {
                    name: 'subject',
                    score: 402609888.32817125,
                    level: 2,
                    impacts: [
                      {
                        evaluator:
                          'HxZfz3ipSp0rHsOhJQlievFqjV3DnU8BE6vhqNSecBM',
                        level: 1,
                        score: 100652472.08204281,
                        confidence: 4,
                        impact: 402609888.32817125,
                      },
                    ],
                  },
                ],
              },
            ],
          },
          {
            name: 'Seed',
            block: 30173280,
            timestamp: 1740433826885,
            hash: 'DiGD5I-jFu92OOejbucI1VK4rjbLS9yUve_8jDB8Y7Y',
          },
          {
            name: 'SeedConnected',
            rank: 1,
            connected: ['Pr5SHCQkGvSc'],
            communities: ['Pr5SHCQkGvSc'],
            reported: [],
            block: 30173280,
            timestamp: 1740433832835,
            hash: 'QjcfBKkCPnVx_nIvbhP8xXLZefarf7ZD7gDQxv-aLu4',
          },
          {
            name: 'SeedConnectedWithFriend',
            friend: null,
            block: 30173280,
            timestamp: 1740433850176,
            hash: 'u7-XTkG6SAykGX00CUCTW1wz5YslRDikYzn9ypvBcV0',
          },
          {
            name: 'BrightID',
            block: 30173280,
            timestamp: 1740433855220,
            hash: '_eJ2ZADJ7Jif-IIBWbqDlA0Krjh5xsI2OStDPD66ir0',
          },
          {
            name: 'SocialRecoverySetup',
            block: 30173280,
            timestamp: 1740433871292,
            hash: 'dvRvehpugFuyvlZ8_gAKQYWKVDGVNUIySbALPms5wsg',
          },
          {
            name: 'Bitu',
            releaseTime: 1653882066611,
            linksNum: 2,
            confirmedScore: 2,
            directReports: {},
            indirectReports: {},
            reportedConnections: {},
            score: 0,
            block: 30173280,
            timestamp: 1740433875239,
            hash: 'RXnLZnjJV0feGrKnnCqqP2dzk-JXuxKmeRJFVjkz2NQ',
          },
        ],
      },
      {
        id: 'wWdbewJzgIZHGXEmEva4grxqgErR-i6HsVtfgSKjbT0',
        level: 'just met',
        reportReason: null,
        timestamp: 1601243422288,
        verifications: [
          {
            name: 'SeedConnected',
            rank: 1,
            connected: ['w4dNg2yUSuuMN_SfPBmqTbdNhk_nsFgwoO36ZUcDt88'],
            communities: ['w4dNg2yUSuuMN_SfPBmqTbdNhk_nsFgwoO36ZUcDt88'],
            reported: [],
            block: 30173280,
            timestamp: 1740433832005,
            hash: 'dMvKtvuBupSK6GE3sJWfunKn_Shl7Bf7Enb-vsdSZ8w',
          },
          {
            name: 'BrightID',
            block: 30173280,
            timestamp: 1740433854492,
            hash: 'IlTnAXMVqFJMxKMarpMKhar7Uljsc-uGt9b39KkWcM4',
          },
        ],
      },
      {
        id: '0g0TP_xvbw8jyM6OT6q8UpGwmaynj3Q_gneZ3Eb14H0',
        level: 'just met',
        reportReason: null,
        timestamp: 1601243495222,
        verifications: [
          {
            name: 'Seed',
            block: 30173280,
            timestamp: 1740433826885,
            hash: '39Iqh7rllGFFWd1QT8ZLqX1-vpmS5dI_HdwP2Gcx_bo',
          },
          {
            name: 'SeedConnected',
            rank: 1,
            connected: ['Pr5SHCQkGvSc'],
            communities: ['Pr5SHCQkGvSc'],
            reported: [],
            block: 30173280,
            timestamp: 1740433832834,
            hash: 'uKRZPzJQFr83gubMSTHI2xWjgdvtejxLqtfUXeQVzbM',
          },
          {
            name: 'SeedConnectedWithFriend',
            friend: null,
            block: 30173280,
            timestamp: 1740433850176,
            hash: 'MNbFRnxps1BwTgW5ue2RNFV3wb2G3jEbJwZo9ZxoXvU',
          },
          {
            name: 'BrightID',
            block: 30173280,
            timestamp: 1740433855220,
            hash: 'bojUXSnL1gYK5wcvYW103gmI7vHUgrnUh8p5ZAJwz0E',
          },
          {
            name: 'SocialRecoverySetup',
            block: 30173280,
            timestamp: 1740433870269,
            hash: 'x2yQCxe8iTek_Qu2kXALn-nx-WT63DMb52acOk28aIE',
          },
        ],
      },
      {
        id: 'CUTd-Jbh6CWiWMU6zN3xIkBH6wH5CB2lr5Ck3nZkALQ',
        level: 'just met',
        reportReason: null,
        timestamp: 1601243423933,
        verifications: [
          {
            name: 'SeedConnected',
            rank: 1,
            connected: ['w4dNg2yUSuuMN_SfPBmqTbdNhk_nsFgwoO36ZUcDt88'],
            communities: ['w4dNg2yUSuuMN_SfPBmqTbdNhk_nsFgwoO36ZUcDt88'],
            reported: [],
            block: 30173280,
            timestamp: 1740433832006,
            hash: 'bFBV2PQZn32V_OpA_MVUhkcF7JxID0jdlV5IFSYRR-I',
          },
          {
            name: 'BrightID',
            block: 30173280,
            timestamp: 1740433854493,
            hash: 'd_EfdzfstVMj6rTEFkKpqjXRc37JNCNDFN1ULW9b_fs',
          },
        ],
      },
      {
        id: 'xqmMHQMnBdakxs3sXXjy7qVqPoXmhhwOt4c_z1tSPwM',
        level: 'just met',
        reportReason: null,
        timestamp: 1601243416667,
        verifications: [
          {
            name: 'Aura',
            block: 30173280,
            timestamp: 1740433826802,
            domains: [
              {
                name: 'BrightID',
                categories: [
                  {
                    name: 'manager',
                    score: 2210769.501123139,
                    level: 2,
                    impacts: [
                      {
                        evaluator:
                          'v5mibmGr9W08lhCI1exZr4PLt4VV7s-nVoJXOVlN2kg',
                        score: 77204.98915193425,
                        confidence: 4,
                        impact: 308819.956607737,
                      },
                      {
                        evaluator:
                          'AsjAK5gJ68SMYvGfCAuROsMrJQ0_83ZS92xy94LlfIA',
                        score: 248561.8394850427,
                        confidence: 4,
                        impact: 994247.3579401708,
                      },
                      {
                        evaluator:
                          'HsKfPmmRtoaws5CQd44Z8u6FhtftTESyL_Q1HT30htQ',
                        score: 60136.64537941398,
                        confidence: 1,
                        impact: 60136.64537941398,
                      },
                      {
                        evaluator:
                          'UxYHGX4JtnUrYTZzVqbTLu9Azw5hAfDK1X7DLXp7_tQ',
                        score: 141800.18236633495,
                        confidence: 3,
                        impact: 425400.54709900485,
                      },
                      {
                        evaluator:
                          'OeNllgD2Q2K845Z_ANwah_9yTbJ5PFpvyY8zITkOuFs',
                        score: 105541.24852420307,
                        confidence: 4,
                        impact: 422164.99409681227,
                      },
                    ],
                  },
                  {
                    name: 'trainer',
                    score: 21097856.903279718,
                    level: 2,
                    impacts: [
                      {
                        evaluator:
                          'v5mibmGr9W08lhCI1exZr4PLt4VV7s-nVoJXOVlN2kg',
                        level: 2,
                        score: 665947.1286166608,
                        confidence: 4,
                        impact: 2663788.5144666433,
                      },
                      {
                        evaluator:
                          'AsjAK5gJ68SMYvGfCAuROsMrJQ0_83ZS92xy94LlfIA',
                        level: 2,
                        score: 2094172.540306506,
                        confidence: 4,
                        impact: 8376690.161226024,
                      },
                      {
                        evaluator:
                          'HsKfPmmRtoaws5CQd44Z8u6FhtftTESyL_Q1HT30htQ',
                        level: 2,
                        score: 522314.2113015379,
                        confidence: 4,
                        impact: 2089256.8452061517,
                      },
                      {
                        evaluator:
                          'UxYHGX4JtnUrYTZzVqbTLu9Azw5hAfDK1X7DLXp7_tQ',
                        level: 2,
                        score: 1343507.9740949725,
                        confidence: 3,
                        impact: 4030523.9222849174,
                      },
                      {
                        evaluator:
                          'OeNllgD2Q2K845Z_ANwah_9yTbJ5PFpvyY8zITkOuFs',
                        level: 2,
                        score: 984399.3650239961,
                        confidence: 4,
                        impact: 3937597.4600959844,
                      },
                    ],
                  },
                  {
                    name: 'player',
                    score: 283726707.50423574,
                    level: 3,
                    impacts: [
                      {
                        evaluator:
                          '-Fh5Fd6THVj8hNFZ-x11C_GWWHVG7U4o0XP1uTwEg38',
                        level: 2,
                        score: 2520155.5971515207,
                        confidence: 4,
                        impact: 10080622.388606083,
                      },
                      {
                        evaluator:
                          'XMbTy7bVInrUsPTBCx45WLTFC92s1JRUPIhsu9Js1-4',
                        level: null,
                        score: null,
                        confidence: 1,
                        impact: 0,
                      },
                      {
                        evaluator:
                          'JT1jXJcuTij0AdWV2h9ePM9ape7rk6Fhq-T7mpHUBbg',
                        level: null,
                        score: null,
                        confidence: 1,
                        impact: 0,
                      },
                      {
                        evaluator:
                          'K08zwQzOKuDAeGLCzTqlvIAFPolujZ7P5VeiVBvC_34',
                        level: null,
                        score: null,
                        confidence: 1,
                        impact: 0,
                      },
                      {
                        evaluator:
                          '7puQsSqow9VRNGDTdhg7NIBe7pvRaPWN-xWhgTvOLo8',
                        level: 2,
                        score: 2953198.095071988,
                        confidence: 1,
                        impact: 2953198.095071988,
                      },
                      {
                        evaluator:
                          'zjnLOD0pOVyXDtSiSOot1V2dGcwxEqBechmZXBI-XgE',
                        level: null,
                        score: null,
                        confidence: 1,
                        impact: 0,
                      },
                      {
                        evaluator:
                          '_UaulVdJPv0jkCBsjClNUlkfMMg0rQFAhYYDb_3B7yk',
                        level: null,
                        score: null,
                        confidence: 1,
                        impact: 0,
                      },
                      {
                        evaluator:
                          'HxZfz3ipSp0rHsOhJQlievFqjV3DnU8BE6vhqNSecBM',
                        level: null,
                        score: null,
                        confidence: 1,
                        impact: 0,
                      },
                      {
                        evaluator:
                          '1Ix6_UTI9FzFD9JVYeX7L-7P0cSt0uBEzoUBK_CL8QY',
                        level: 2,
                        score: 11702617.28153414,
                        confidence: 1,
                        impact: 11702617.28153414,
                      },
                      {
                        evaluator:
                          'AdrPoRA1-esbTrKwbT2mSqiMIjPkC_4rGA8SnGuqNrQ',
                        level: null,
                        score: null,
                        confidence: 1,
                        impact: 0,
                      },
                      {
                        evaluator:
                          '0YEMHuUL4_Bq3H3Rg0B1fn1cvvsQSi2A6QcBgq5Xp78',
                        level: null,
                        score: null,
                        confidence: 1,
                        impact: 0,
                      },
                      {
                        evaluator:
                          'qdLeaaPFc0xPYna_PFY2VRAKaKAsNyD8uLwY30TS5VU',
                        level: null,
                        score: null,
                        confidence: 1,
                        impact: 0,
                      },
                      {
                        evaluator:
                          'zUTCJG6Kdwzas63OAWol8F8qmYY_RqaULE0ip-wQT_g',
                        level: null,
                        score: null,
                        confidence: 1,
                        impact: 0,
                      },
                      {
                        evaluator:
                          'ER-WJw5P6BUgmwdzg3IqlNtoU-NdftD3eukVaGW40j0',
                        level: null,
                        score: null,
                        confidence: 1,
                        impact: 0,
                      },
                      {
                        evaluator:
                          'jxwugksWF7gJS_DCLsUPG5rm4qTSSw6GbDKMCmnVj1E',
                        level: null,
                        score: null,
                        confidence: 1,
                        impact: 0,
                      },
                      {
                        evaluator:
                          'VURzTXXrHdhYjHCteK_iyn7q3UxNMuP2lZ7z_siLSO8',
                        level: null,
                        score: null,
                        confidence: 1,
                        impact: 0,
                      },
                      {
                        evaluator:
                          'IRfPAiw08wPgDyQRfJwSB7e3RkYm1So0YE-pzbSCAlA',
                        level: null,
                        score: null,
                        confidence: 1,
                        impact: 0,
                      },
                      {
                        evaluator:
                          'THIZTex4jQPGtJdAePfGF_1E3GM9AeRD8bVOVu0ziZk',
                        level: null,
                        score: null,
                        confidence: 1,
                        impact: 0,
                      },
                      {
                        evaluator:
                          'AWtJ0wj7j1sFkZStsh6n3UvXsX3pGj9Oqgw2xMF9B_Y',
                        level: null,
                        score: null,
                        confidence: 1,
                        impact: 0,
                      },
                      {
                        evaluator:
                          '09w4r-qB7nfooRBN0_FmM9r5SwWfwpIn-x1rNTfE6IA',
                        level: 2,
                        score: 20670019.391396683,
                        confidence: 1,
                        impact: 20670019.391396683,
                      },
                      {
                        evaluator:
                          'T1HzBEG95I9PUJWJjFOsJMbBFHjCm8iNl76-7N33deM',
                        level: null,
                        score: null,
                        confidence: 1,
                        impact: 0,
                      },
                      {
                        evaluator:
                          'I1Hz9L532aMra_RdzxUPh46bqrj4LUuHwuvSPLBwWbE',
                        level: 2,
                        score: 6399114.581736151,
                        confidence: 1,
                        impact: 6399114.581736151,
                      },
                      {
                        evaluator:
                          'pQU_kWrL6E7M3J9FIg4LLd0tBSwcPy7p8ziUe9cdrfo',
                        level: null,
                        score: null,
                        confidence: 1,
                        impact: 0,
                      },
                      {
                        evaluator:
                          'v5mibmGr9W08lhCI1exZr4PLt4VV7s-nVoJXOVlN2kg',
                        level: 2,
                        score: 16176149.369096812,
                        confidence: 3,
                        impact: 48528448.10729043,
                      },
                      {
                        evaluator:
                          'frVVRCFkvHNjdAVcNs_ZzTd4Xz-rGTyPW1AeCrNsHN4',
                        level: null,
                        score: null,
                        confidence: 3,
                        impact: 0,
                      },
                      {
                        evaluator:
                          'AsjAK5gJ68SMYvGfCAuROsMrJQ0_83ZS92xy94LlfIA',
                        level: 2,
                        score: 21564244.746546254,
                        confidence: 3,
                        impact: 64692734.23963876,
                      },
                      {
                        evaluator:
                          'HsKfPmmRtoaws5CQd44Z8u6FhtftTESyL_Q1HT30htQ',
                        level: 2,
                        score: 7108554.950436223,
                        confidence: 4,
                        impact: 28434219.801744893,
                      },
                      {
                        evaluator:
                          'UxYHGX4JtnUrYTZzVqbTLu9Azw5hAfDK1X7DLXp7_tQ',
                        level: 2,
                        score: 9441584.39018921,
                        confidence: 3,
                        impact: 28324753.17056763,
                      },
                      {
                        evaluator:
                          'OeNllgD2Q2K845Z_ANwah_9yTbJ5PFpvyY8zITkOuFs',
                        level: 2,
                        score: 15485245.111662246,
                        confidence: 4,
                        impact: 61940980.446648985,
                      },
                    ],
                  },
                  {
                    name: 'subject',
                    score: 12378392809.290863,
                    level: 4,
                    impacts: [
                      {
                        evaluator:
                          's56WKMXMz5TdXdCYVO1XKekrWo-jYhODN6GFH9QdhwE',
                        level: 3,
                        score: 134867285.85970923,
                        confidence: 4,
                        impact: 539469143.4388369,
                      },
                      {
                        evaluator:
                          'VM-DY1Gpl6jvuxHjMRjt8eHDcUh1pxCj5KQXR2714yU',
                        level: 2,
                        score: 99915223.05616462,
                        confidence: 3,
                        impact: 299745669.16849387,
                      },
                      {
                        evaluator:
                          'oZUp1_k5CipSmyI0qgeh1jqrkh4EmIXOIoT_qNaJ8lg',
                        level: 1,
                        score: 21097856.903279718,
                        confidence: 1,
                        impact: 21097856.903279718,
                      },
                      {
                        evaluator:
                          '-0sfRYkt0glDTBK1Qhe9RVm3RHInp-ybLMLav_U-shw',
                        level: 1,
                        score: 21564244.746546254,
                        confidence: 2,
                        impact: 43128489.49309251,
                      },
                      {
                        evaluator:
                          'Xy3pEJK37uDfnxIpEsNDjRXi7doRdSsTDU4FKT_UaIY',
                        level: null,
                        score: null,
                        confidence: 4,
                        impact: 0,
                      },
                      {
                        evaluator:
                          'YztBoikEQ-rE9rMDHG2d0R1LK5PntbNxgsAhOhKQmiA',
                        level: 1,
                        score: 42662101.649825975,
                        confidence: 1,
                        impact: 42662101.649825975,
                      },
                      {
                        evaluator:
                          'xqmMHQMnBdakxs3sXXjy7qVqPoXmhhwOt4c_z1tSPwM',
                        level: 3,
                        score: 283726707.50423574,
                        confidence: 4,
                        impact: 1134906830.016943,
                      },
                      {
                        evaluator:
                          'XMbTy7bVInrUsPTBCx45WLTFC92s1JRUPIhsu9Js1-4',
                        level: 3,
                        score: 63293570.70983915,
                        confidence: 4,
                        impact: 253174282.8393566,
                      },
                      {
                        evaluator:
                          'JT1jXJcuTij0AdWV2h9ePM9ape7rk6Fhq-T7mpHUBbg',
                        level: 2,
                        score: 63759958.55310569,
                        confidence: 4,
                        impact: 255039834.21242276,
                      },
                      {
                        evaluator:
                          'K08zwQzOKuDAeGLCzTqlvIAFPolujZ7P5VeiVBvC_34',
                        level: 1,
                        score: 42662101.649825975,
                        confidence: 4,
                        impact: 170648406.5993039,
                      },
                      {
                        evaluator:
                          '7puQsSqow9VRNGDTdhg7NIBe7pvRaPWN-xWhgTvOLo8',
                        level: 3,
                        score: 180328724.67666632,
                        confidence: 4,
                        impact: 721314898.7066653,
                      },
                      {
                        evaluator:
                          'zjnLOD0pOVyXDtSiSOot1V2dGcwxEqBechmZXBI-XgE',
                        level: null,
                        score: null,
                        confidence: 1,
                        impact: 0,
                      },
                      {
                        evaluator:
                          '_UaulVdJPv0jkCBsjClNUlkfMMg0rQFAhYYDb_3B7yk',
                        level: 3,
                        score: 118378412.15031278,
                        confidence: 4,
                        impact: 473513648.6012511,
                      },
                      {
                        evaluator:
                          'HxZfz3ipSp0rHsOhJQlievFqjV3DnU8BE6vhqNSecBM',
                        level: 1,
                        score: 100652472.08204281,
                        confidence: 4,
                        impact: 402609888.32817125,
                      },
                      {
                        evaluator:
                          '1Ix6_UTI9FzFD9JVYeX7L-7P0cSt0uBEzoUBK_CL8QY',
                        level: 3,
                        score: 130206694.59939781,
                        confidence: 4,
                        impact: 520826778.39759123,
                      },
                      {
                        evaluator:
                          'AdrPoRA1-esbTrKwbT2mSqiMIjPkC_4rGA8SnGuqNrQ',
                        level: 1,
                        score: 42662101.649825975,
                        confidence: 4,
                        impact: 170648406.5993039,
                      },
                      {
                        evaluator:
                          '0YEMHuUL4_Bq3H3Rg0B1fn1cvvsQSi2A6QcBgq5Xp78',
                        level: 1,
                        score: 21097856.903279718,
                        confidence: 4,
                        impact: 84391427.61311887,
                      },
                      {
                        evaluator:
                          'qdLeaaPFc0xPYna_PFY2VRAKaKAsNyD8uLwY30TS5VU',
                        level: null,
                        score: null,
                        confidence: 4,
                        impact: 0,
                      },
                      {
                        evaluator:
                          'zUTCJG6Kdwzas63OAWol8F8qmYY_RqaULE0ip-wQT_g',
                        level: 1,
                        score: 32800474.184813857,
                        confidence: 4,
                        impact: 131201896.73925543,
                      },
                      {
                        evaluator:
                          'ER-WJw5P6BUgmwdzg3IqlNtoU-NdftD3eukVaGW40j0',
                        level: 1,
                        score: 42662101.649825975,
                        confidence: 4,
                        impact: 170648406.5993039,
                      },
                      {
                        evaluator:
                          'jxwugksWF7gJS_DCLsUPG5rm4qTSSw6GbDKMCmnVj1E',
                        level: 0,
                        score: 0,
                        confidence: 4,
                        impact: 0,
                      },
                      {
                        evaluator:
                          'VURzTXXrHdhYjHCteK_iyn7q3UxNMuP2lZ7z_siLSO8',
                        level: 0,
                        score: 0,
                        confidence: 4,
                        impact: 0,
                      },
                      {
                        evaluator:
                          'IRfPAiw08wPgDyQRfJwSB7e3RkYm1So0YE-pzbSCAlA',
                        level: 1,
                        score: 49061216.23156212,
                        confidence: 4,
                        impact: 196244864.9262485,
                      },
                      {
                        evaluator:
                          'THIZTex4jQPGtJdAePfGF_1E3GM9AeRD8bVOVu0ziZk',
                        level: 0,
                        score: 0,
                        confidence: 1,
                        impact: 0,
                      },
                      {
                        evaluator:
                          'AWtJ0wj7j1sFkZStsh6n3UvXsX3pGj9Oqgw2xMF9B_Y',
                        level: 3,
                        score: 152720819.208647,
                        confidence: 4,
                        impact: 610883276.834588,
                      },
                      {
                        evaluator:
                          '09w4r-qB7nfooRBN0_FmM9r5SwWfwpIn-x1rNTfE6IA',
                        level: 3,
                        score: 203002315.72423297,
                        confidence: 4,
                        impact: 812009262.8969319,
                      },
                      {
                        evaluator:
                          'T1HzBEG95I9PUJWJjFOsJMbBFHjCm8iNl76-7N33deM',
                        level: 1,
                        score: 21097856.903279718,
                        confidence: 4,
                        impact: 84391427.61311887,
                      },
                      {
                        evaluator:
                          'I1Hz9L532aMra_RdzxUPh46bqrj4LUuHwuvSPLBwWbE',
                        level: 3,
                        score: 85790591.14291848,
                        confidence: 4,
                        impact: 343162364.5716739,
                      },
                      {
                        evaluator:
                          'pQU_kWrL6E7M3J9FIg4LLd0tBSwcPy7p8ziUe9cdrfo',
                        level: 1,
                        score: 97610002.27358976,
                        confidence: 3,
                        impact: 292830006.8207693,
                      },
                      {
                        evaluator:
                          'v5mibmGr9W08lhCI1exZr4PLt4VV7s-nVoJXOVlN2kg',
                        level: 3,
                        score: 301995876.24125063,
                        confidence: 3,
                        impact: 905987628.7237519,
                      },
                      {
                        evaluator:
                          'frVVRCFkvHNjdAVcNs_ZzTd4Xz-rGTyPW1AeCrNsHN4',
                        level: 3,
                        score: 76395351.5211729,
                        confidence: 4,
                        impact: 305581406.0846916,
                      },
                      {
                        evaluator:
                          'AsjAK5gJ68SMYvGfCAuROsMrJQ0_83ZS92xy94LlfIA',
                        level: 3,
                        score: 302332518.53370947,
                        confidence: 4,
                        impact: 1209330074.1348379,
                      },
                      {
                        evaluator:
                          'HsKfPmmRtoaws5CQd44Z8u6FhtftTESyL_Q1HT30htQ',
                        level: 3,
                        score: 104207372.08003037,
                        confidence: 4,
                        impact: 416829488.32012147,
                      },
                      {
                        evaluator:
                          'UxYHGX4JtnUrYTZzVqbTLu9Azw5hAfDK1X7DLXp7_tQ',
                        level: 3,
                        score: 244479365.61455446,
                        confidence: 4,
                        impact: 977917462.4582179,
                      },
                      {
                        evaluator:
                          'OeNllgD2Q2K845Z_ANwah_9yTbJ5PFpvyY8zITkOuFs',
                        level: 3,
                        score: 197049394.99992335,
                        confidence: 4,
                        impact: 788197579.9996934,
                      },
                    ],
                  },
                ],
              },
            ],
          },
          {
            name: 'Seed',
            block: 30173280,
            timestamp: 1740433826884,
            hash: 'Ikjsv1FoPImIXZsUTmQ9jR3tiWzOih-C4m0w6KYmQlM',
          },
          {
            name: 'SeedConnected',
            rank: 19,
            connected: [
              'ETxf2qlnq4Kh',
              'weKyDO9uEPz-KzO13IupiCzT40fgKhETD2kKuX3ZoqA',
              'GYGbx74q6-pYRG4UHNfrMVyZ6ZIZQYUCSHhlBGkvBjE',
              'ufl4PdK91Qf_1Efb61chYN6Sa6BZjU8mjPSqBbrDhDk',
              '---U49atc2d-z0HFP_0-qeml3rsj_I7Nsd7QA5aP7mc',
              'PbtXC7NF5bhiyrDoCShlg3iKK3d9bto_uxg9B4BGv9E',
              'aM4xs1M1MB42ApdYrEQyOBQX2hzdsSGHZ1oiXPq6K5A',
              'bSGdH_RTE9CbHvBpx3Y08OUE0cw7fexp7y0M-9pD4S0',
              'vPmP-pkagrl02LrGgIaFf4aimR4rTrbnIcYT5t7q2w4',
              'jutFlbXP0eJnJ2sPT8aibSYdYVde9XQZ_i-z96N9r1w',
              'sVYW_wqVAxaoT2K1Va9duLjQ1jmgnUuvVP82bPDrAL8',
              '1-pATyOX1vFw-Sg6ilWsSW1W1chLN5aqmNvvUe_W4Jk',
              'JUg3dZMqyyhX0il6Q9TSQQeUWNbTz6USO6f6boyyLHY',
              'lQ1kMUbQXuIW_2c_WxF5f6Ko8Gqg6eVaWuu9cQjZkYQ',
              '7mkubSPCJDfK7wTJHmSe9GCsCfhJNNVzozqw_J31Eck',
              '8k0uJqf0wtapuC4K2aLPCk9IUe5fv_w33gt5twFI6Go',
              'qOKewbkPJTnu7rVAA8j3NTCt7EaBZ5fm_cJfEqCHTas',
              'rTRQfFHu79WSyd-dOAG0Q_wCZEKNCER3ugevL5S6yl0',
              'c_QZZoYP75fmP_FRxF1kDyHrhQYtvqPRLb-8okABb5s',
            ],
            communities: [
              'ETxf2qlnq4Kh',
              'weKyDO9uEPz-KzO13IupiCzT40fgKhETD2kKuX3ZoqA',
              'GYGbx74q6-pYRG4UHNfrMVyZ6ZIZQYUCSHhlBGkvBjE',
              'ufl4PdK91Qf_1Efb61chYN6Sa6BZjU8mjPSqBbrDhDk',
              '---U49atc2d-z0HFP_0-qeml3rsj_I7Nsd7QA5aP7mc',
              'PbtXC7NF5bhiyrDoCShlg3iKK3d9bto_uxg9B4BGv9E',
              'aM4xs1M1MB42ApdYrEQyOBQX2hzdsSGHZ1oiXPq6K5A',
              'bSGdH_RTE9CbHvBpx3Y08OUE0cw7fexp7y0M-9pD4S0',
              'vPmP-pkagrl02LrGgIaFf4aimR4rTrbnIcYT5t7q2w4',
              'jutFlbXP0eJnJ2sPT8aibSYdYVde9XQZ_i-z96N9r1w',
              'sVYW_wqVAxaoT2K1Va9duLjQ1jmgnUuvVP82bPDrAL8',
              '1-pATyOX1vFw-Sg6ilWsSW1W1chLN5aqmNvvUe_W4Jk',
              'JUg3dZMqyyhX0il6Q9TSQQeUWNbTz6USO6f6boyyLHY',
              'lQ1kMUbQXuIW_2c_WxF5f6Ko8Gqg6eVaWuu9cQjZkYQ',
              '7mkubSPCJDfK7wTJHmSe9GCsCfhJNNVzozqw_J31Eck',
              '-z6lbLFK4yxj1YmrUz7dYttceEg1XWZRoD_V8xE8qC0',
              '3vqWfpOxP2fR',
              'Dbu8rcx59Cml',
              'Pr5SHCQkGvSc',
              'mKkG_Vk0fOoy',
              'Tf6Wtwlhjy3gydBvGsdPgVH0ttZXM-SOeFZIZePvZdg',
              '8k0uJqf0wtapuC4K2aLPCk9IUe5fv_w33gt5twFI6Go',
              'qOKewbkPJTnu7rVAA8j3NTCt7EaBZ5fm_cJfEqCHTas',
              'rTRQfFHu79WSyd-dOAG0Q_wCZEKNCER3ugevL5S6yl0',
              'c_QZZoYP75fmP_FRxF1kDyHrhQYtvqPRLb-8okABb5s',
            ],
            reported: [],
            block: 30173280,
            timestamp: 1740433832680,
            hash: 'OoFsCq0lWi9V-NJOqAT_1OcJeFXeYa3_gC3OtpT3eVQ',
          },
          {
            name: 'SeedConnectedWithFriend',
            friend: null,
            block: 30173280,
            timestamp: 1740433850175,
            hash: 'VZqLzFIVaf0hBfoEl9mSKEFSqzDSq6Zbg7PvcQwPATI',
          },
          {
            name: 'BrightID',
            block: 30173280,
            timestamp: 1740433855064,
            hash: 'aakdTexqoLcRs3McFgQDCWBw1TmijR7-7DUQYzdekP4',
          },
          {
            name: 'SocialRecoverySetup',
            block: 30173280,
            timestamp: 1740433874631,
            hash: 'oklseJKmkb0qOSC_x98fOwmg6Qp3a_qFMgUtRtRe5TU',
          },
          {
            name: 'Bitu',
            releaseTime: 1653882066611,
            linksNum: 224,
            confirmedScore: 224,
            directReports: {},
            indirectReports: {},
            reportedConnections: {},
            score: 238,
            block: 30173280,
            timestamp: 1740433875234,
            hash: 'i1G_uTCe_QCWu7kwWt8m73eRct9KzQYKWiCOY1bXgek',
          },
        ],
      },
      {
        id: 'ofkMCGjWSAwrqQtCCAbttrsesldG624nWScEKKLNm2s',
        level: 'just met',
        reportReason: null,
        timestamp: 1601243557625,
        verifications: [
          {
            name: 'SeedConnected',
            rank: 1,
            connected: ['3vqWfpOxP2fR'],
            communities: ['3vqWfpOxP2fR'],
            reported: [],
            block: 30173280,
            timestamp: 1740433831824,
            hash: 'gZgfnQAi2sor2XvZsOtlHSgQkQXgIX8Y36U8xj7V6lc',
          },
          {
            name: 'BrightID',
            block: 30173280,
            timestamp: 1740433854324,
            hash: 'GycyUOROplFekKWOWyKEeSsYz-L68ykBYOzSkOAD2uc',
          },
        ],
      },
      {
        id: '2jNMU_cOkE9mcgFDhLUXGrXS_2ovQi-NeFdi8iAzM7A',
        level: 'just met',
        reportReason: null,
        timestamp: 1601243567376,
        verifications: [
          {
            name: 'SeedConnected',
            rank: 1,
            connected: ['oD8jAEuJx1NuNuZnb4AkHiJPtQDn0fIApyHjimFsS6I'],
            communities: ['oD8jAEuJx1NuNuZnb4AkHiJPtQDn0fIApyHjimFsS6I'],
            reported: [],
            block: 30173280,
            timestamp: 1740433832006,
            hash: 'jckO9xG_-3wv8YoiTmFD89f8CjQCDNOJhs93vEA4x4E',
          },
          {
            name: 'BrightID',
            block: 30173280,
            timestamp: 1740433854493,
            hash: 'ZJI5fEMcJ2r6gxyNz_JI35n8LxPgOVB4rMsJMYYz5TA',
          },
        ],
      },
      {
        id: 'X9FMAf4D_UbTY9MDrkPNG5mEakBG_bhYVzx_vF0qXQw',
        level: 'just met',
        reportReason: null,
        timestamp: 1601243460109,
        verifications: [
          {
            name: 'SeedConnected',
            rank: 1,
            connected: ['w4dNg2yUSuuMN_SfPBmqTbdNhk_nsFgwoO36ZUcDt88'],
            communities: ['w4dNg2yUSuuMN_SfPBmqTbdNhk_nsFgwoO36ZUcDt88'],
            reported: [],
            block: 30173280,
            timestamp: 1740433832006,
            hash: 'il-SH1wuZa4xGhUCRe9up1XvPOEEnM2Ggx6AVRFUzZg',
          },
          {
            name: 'BrightID',
            block: 30173280,
            timestamp: 1740433854493,
            hash: 'rU4FHazCjKEEQz5e2rkU64amPxCFFKMnj3fSSs0tJxI',
          },
        ],
      },
      {
        id: 'Dxys6YaqcKYLs_cRTsWcjdqE7I7aJt2qBz6AHh8bxlQ',
        level: 'just met',
        reportReason: null,
        timestamp: 1601243421761,
        verifications: [
          {
            name: 'SeedConnected',
            rank: 1,
            connected: ['3vqWfpOxP2fR'],
            communities: ['3vqWfpOxP2fR'],
            reported: [],
            block: 30173280,
            timestamp: 1740433832006,
            hash: 'uwAi_2C75g7UPYVDi10ucUpbYBOtXsgSyVsf5j09UBE',
          },
          {
            name: 'BrightID',
            block: 30173280,
            timestamp: 1740433854494,
            hash: '1IABtuN5U4oHAZKlYPnxGEr0L2qhxJ3CE0YRNdi-qDs',
          },
        ],
      },
      {
        id: 'ru_1KJrFzGQnAxAF9aMxv7TbmTVYpabVYWb9z6xZIFs',
        level: 'just met',
        reportReason: null,
        timestamp: 1601465804867,
        verifications: [
          {
            name: 'Seed',
            block: 30173280,
            timestamp: 1740433826885,
            hash: '0aEctNV9KARQXq2YEaXLOoLZZbhXOFok1_ot7Joz-0Y',
          },
          {
            name: 'SeedConnected',
            rank: 1,
            connected: ['-z6lbLFK4yxj1YmrUz7dYttceEg1XWZRoD_V8xE8qC0'],
            communities: ['-z6lbLFK4yxj1YmrUz7dYttceEg1XWZRoD_V8xE8qC0'],
            reported: [],
            block: 30173280,
            timestamp: 1740433831657,
            hash: 'o9l-bZhvBH8iD8ns7yX-C5ituS6C0qUPnDvdXp0EuT0',
          },
          {
            name: 'SeedConnectedWithFriend',
            friend: null,
            block: 30173280,
            timestamp: 1740433850176,
            hash: 'y1Pdjw1wJASOW-kKZtv-TUqCeaqYX1eniQlGZMpZc3o',
          },
          {
            name: 'BrightID',
            block: 30173280,
            timestamp: 1740433854157,
            hash: 'waXAblVcS51Gq7DD5dcsCnbh0qz4_OkjNrlIepC6Jr0',
          },
        ],
      },
      {
        id: 'j7veWSOC9ywsPGUXgqOThlZFhGJEMUJrWTwids8I2NM',
        level: 'just met',
        reportReason: null,
        timestamp: 1601577417662,
        verifications: [
          {
            name: 'SeedConnected',
            rank: 1,
            connected: ['Tf6Wtwlhjy3gydBvGsdPgVH0ttZXM-SOeFZIZePvZdg'],
            communities: ['Tf6Wtwlhjy3gydBvGsdPgVH0ttZXM-SOeFZIZePvZdg'],
            reported: [],
            block: 30173280,
            timestamp: 1740433832018,
            hash: 'z4Bdup-3FEQUWzEom6b9LBmQoaBrdQGNJR-Xhocq6Ew',
          },
          {
            name: 'BrightID',
            block: 30173280,
            timestamp: 1740433854507,
            hash: 'xfsSYvR0IXr4VTqQyo7xC4Ybq9ruo8-B7XOy9AvHRTE',
          },
        ],
      },
      {
        id: 'FzKdBd9LWu00pDRUkoh9npIMDZOq4osodqznUeVUZnQ',
        level: 'recovery',
        reportReason: null,
        timestamp: 1603268154599,
        verifications: [
          {
            name: 'Seed',
            block: 30173280,
            timestamp: 1740433826884,
            hash: 'sN1fxnImxSg4-RVRoTOHWypInC-l5b2BfXsmu_Fy75U',
          },
          {
            name: 'SeedConnected',
            rank: -5,
            connected: ['Pr5SHCQkGvSc'],
            communities: ['Pr5SHCQkGvSc'],
            reported: [
              'Pr5SHCQkGvSc',
              'Tf6Wtwlhjy3gydBvGsdPgVH0ttZXM-SOeFZIZePvZdg',
            ],
            block: 30173280,
            timestamp: 1740433832834,
            hash: 'Gfy4lU5luEBPnqtXboM2Ktfq2b7VOl828WdTWHfWi68',
          },
          {
            name: 'SeedConnectedWithFriend',
            friend: null,
            block: 30173280,
            timestamp: 1740433851527,
            hash: '6iCb69K78McUEf_uUL2pBk9rd9fWlv58Kk6fuNH34AM',
          },
          {
            name: 'Bitu',
            releaseTime: 1653882066611,
            linksNum: 13,
            confirmedScore: 10,
            directReports: {},
            indirectReports: {
              ShWqKn_CoxuNl3slAJ_krl8vEI7qqJ8sSNBfN8X9h5Q: -1,
              TUnr9EjYPpUITRR3k5my7aGWghdv_Hdi3jVv15P1N3k: -2,
            },
            reportedConnections: {
              ShWqKn_CoxuNl3slAJ_krl8vEI7qqJ8sSNBfN8X9h5Q: [
                'frLHtQ0nk-vgd99BAK9y-PLnN0UsO3FPrNs-Db-i9K8',
              ],
              TUnr9EjYPpUITRR3k5my7aGWghdv_Hdi3jVv15P1N3k: [
                'x8D-HX9bljRsxu0mWkVzMOJlyHmffQvnPrG9I-HTJbQ',
                'frLHtQ0nk-vgd99BAK9y-PLnN0UsO3FPrNs-Db-i9K8',
              ],
            },
            score: 0,
            block: 30173280,
            timestamp: 1740433875239,
            hash: '2RFXbe7KZgUEodv6W8Q2oHJKqGWN8BVcykM8UcOsIps',
          },
        ],
      },
      {
        id: 'svx71Y9ezxiK5IH_5xd362pXaGOT20WK1eaXUKDcZO4',
        level: 'recovery',
        reportReason: null,
        timestamp: 1603268154599,
        verifications: [
          {
            name: 'Seed',
            block: 30173280,
            timestamp: 1740433826884,
            hash: 'LLpqno6R4AmhiicBidDwymfEt7F6cox2gGtcNRfowWo',
          },
          {
            name: 'SeedConnected',
            rank: -35,
            connected: ['Pr5SHCQkGvSc'],
            communities: ['Pr5SHCQkGvSc'],
            reported: [
              '-z6lbLFK4yxj1YmrUz7dYttceEg1XWZRoD_V8xE8qC0',
              '3vqWfpOxP2fR',
              'Dbu8rcx59Cml',
              'ETxf2qlnq4Kh',
              'Pr5SHCQkGvSc',
              'mKkG_Vk0fOoy',
              'oD8jAEuJx1NuNuZnb4AkHiJPtQDn0fIApyHjimFsS6I',
              'f7koQjPrKUaFTBjwW3-AT1o9TRQFfTk0STNHuKi-b8M',
              'Tf6Wtwlhjy3gydBvGsdPgVH0ttZXM-SOeFZIZePvZdg',
              'hWIVtbx4VcSVAY1_r1bIH66QvS9RNFXJWGKTy_c5qxY',
              'ufl4PdK91Qf_1Efb61chYN6Sa6BZjU8mjPSqBbrDhDk',
              'rTRQfFHu79WSyd-dOAG0Q_wCZEKNCER3ugevL5S6yl0',
            ],
            block: 30173280,
            timestamp: 1740433832834,
            hash: 'Ink28i8fTAPQEirML3tst8d5J5pXgbMnn3--ngTUVbk',
          },
          {
            name: 'SeedConnectedWithFriend',
            friend: null,
            block: 30173280,
            timestamp: 1740433851820,
            hash: 'ONYoL8Gj1LdezbM4PKkLABplfdVE8OBJWVIFoDCVI_o',
          },
          {
            name: 'Bitu',
            releaseTime: 1653882066611,
            linksNum: 25,
            confirmedScore: 19,
            directReports: {},
            indirectReports: {
              TUnr9EjYPpUITRR3k5my7aGWghdv_Hdi3jVv15P1N3k: -2,
              ShWqKn_CoxuNl3slAJ_krl8vEI7qqJ8sSNBfN8X9h5Q: -1,
              j07qLQF84CppaMqy4hzHm8CU4JJ2dLuRzkSXkob51uE: -1,
              bWci3E7WbM24vxrzSbz0gljG2GywkrgdZyvYtzTvXj4: -1,
              zDi6kJaO3JKkv8e72Q9u7rdecPYkzfb6a2lOxJaDZHE: -1,
            },
            reportedConnections: {
              TUnr9EjYPpUITRR3k5my7aGWghdv_Hdi3jVv15P1N3k: [
                'x8D-HX9bljRsxu0mWkVzMOJlyHmffQvnPrG9I-HTJbQ',
                'frLHtQ0nk-vgd99BAK9y-PLnN0UsO3FPrNs-Db-i9K8',
              ],
              ShWqKn_CoxuNl3slAJ_krl8vEI7qqJ8sSNBfN8X9h5Q: [
                'frLHtQ0nk-vgd99BAK9y-PLnN0UsO3FPrNs-Db-i9K8',
              ],
              j07qLQF84CppaMqy4hzHm8CU4JJ2dLuRzkSXkob51uE: [
                'frLHtQ0nk-vgd99BAK9y-PLnN0UsO3FPrNs-Db-i9K8',
              ],
              bWci3E7WbM24vxrzSbz0gljG2GywkrgdZyvYtzTvXj4: [
                'frLHtQ0nk-vgd99BAK9y-PLnN0UsO3FPrNs-Db-i9K8',
              ],
              zDi6kJaO3JKkv8e72Q9u7rdecPYkzfb6a2lOxJaDZHE: [
                'frLHtQ0nk-vgd99BAK9y-PLnN0UsO3FPrNs-Db-i9K8',
              ],
            },
            score: 0,
            block: 30173280,
            timestamp: 1740433875235,
            hash: 'Tz5cQOE104BFD56-QazVQGo695Qn_aVSxPFOaEJVpng',
          },
        ],
      },
      {
        id: 'wWQCn_pBjBQUDKa6POkUvyYkQye4CIhBExDSicKjcPw',
        level: 'recovery',
        reportReason: null,
        timestamp: 1603268154599,
        verifications: [
          {
            name: 'SeedConnected',
            rank: 1,
            connected: ['Tf6Wtwlhjy3gydBvGsdPgVH0ttZXM-SOeFZIZePvZdg'],
            communities: ['Tf6Wtwlhjy3gydBvGsdPgVH0ttZXM-SOeFZIZePvZdg'],
            reported: [],
            block: 30173280,
            timestamp: 1740433832007,
            hash: 'vT2pVw0FqMoS07LblXgYq4OOAKT84tPkbKloGtP1YCo',
          },
          {
            name: 'SeedConnectedWithFriend',
            friend: 'XlrI8CPcWZIMNNIXNe9gPA_0n8CEV_E4GUUiGWAlCoI',
            block: 30173280,
            timestamp: 1740433850177,
            hash: '4cBqG0xffLNeKmaw6DTUnwV036cm1u5KFgqcwjkds5c',
          },
          {
            name: 'BrightID',
            block: 30173280,
            timestamp: 1740433854495,
            hash: 'dSd9ytT-0i1DF154peqyv-4gMgGLUkWvaTKIcuiu8Ns',
          },
        ],
      },
      {
        id: 'HDxr7CI1T0mdsPvKy8Pij_s2UUX7gbXqJrSXh7SNNm4',
        level: 'recovery',
        reportReason: null,
        timestamp: 1603268154599,
        verifications: [
          {
            name: 'Aura',
            block: 30173280,
            timestamp: 1740433826802,
            domains: [
              {
                name: 'BrightID',
                categories: [
                  {
                    name: 'subject',
                    score: 402609888.32817125,
                    level: 2,
                    impacts: [
                      {
                        evaluator:
                          'HxZfz3ipSp0rHsOhJQlievFqjV3DnU8BE6vhqNSecBM',
                        level: 1,
                        score: 100652472.08204281,
                        confidence: 4,
                        impact: 402609888.32817125,
                      },
                    ],
                  },
                ],
              },
            ],
          },
          {
            name: 'SeedConnected',
            rank: -11,
            connected: ['Pr5SHCQkGvSc'],
            communities: ['Pr5SHCQkGvSc'],
            reported: [
              'Pr5SHCQkGvSc',
              'Tf6Wtwlhjy3gydBvGsdPgVH0ttZXM-SOeFZIZePvZdg',
              'ufl4PdK91Qf_1Efb61chYN6Sa6BZjU8mjPSqBbrDhDk',
              'rTRQfFHu79WSyd-dOAG0Q_wCZEKNCER3ugevL5S6yl0',
            ],
            block: 30173280,
            timestamp: 1740433832835,
            hash: 'FooKjBkWjWGTQTHmbf2hRq7pSStbgmqXuS7BEBB0Be4',
          },
          {
            name: 'Bitu',
            releaseTime: 1653882066611,
            linksNum: 2,
            confirmedScore: 2,
            directReports: {},
            indirectReports: {},
            reportedConnections: {},
            score: 0,
            block: 30173280,
            timestamp: 1740433875239,
            hash: 'quj21ZXQy1TRsRfg5T-sogjkkhoZ-gAZYqOw5aRxiZs',
          },
        ],
      },
      {
        id: 'Lpd0vMlq2Yb5qDu4VLJDOmn1vS-eIViarfrgPMMduQQ',
        level: 'just met',
        reportReason: null,
        timestamp: 1615891846818,
        verifications: [
          {
            name: 'Aura',
            block: 30173280,
            timestamp: 1740433826802,
            domains: [
              {
                name: 'BrightID',
                categories: [
                  {
                    name: 'player',
                    score: 74280569.18564758,
                    level: 1,
                    impacts: [
                      {
                        evaluator:
                          'JT1jXJcuTij0AdWV2h9ePM9ape7rk6Fhq-T7mpHUBbg',
                        level: null,
                        score: null,
                        confidence: 1,
                        impact: 0,
                      },
                      {
                        evaluator:
                          '7puQsSqow9VRNGDTdhg7NIBe7pvRaPWN-xWhgTvOLo8',
                        level: 2,
                        score: 2953198.095071988,
                        confidence: 1,
                        impact: 2953198.095071988,
                      },
                      {
                        evaluator:
                          '_UaulVdJPv0jkCBsjClNUlkfMMg0rQFAhYYDb_3B7yk',
                        level: null,
                        score: null,
                        confidence: 1,
                        impact: 0,
                      },
                      {
                        evaluator:
                          'HxZfz3ipSp0rHsOhJQlievFqjV3DnU8BE6vhqNSecBM',
                        level: null,
                        score: null,
                        confidence: 1,
                        impact: 0,
                      },
                      {
                        evaluator:
                          '1Ix6_UTI9FzFD9JVYeX7L-7P0cSt0uBEzoUBK_CL8QY',
                        level: 2,
                        score: 11702617.28153414,
                        confidence: 1,
                        impact: 11702617.28153414,
                      },
                      {
                        evaluator:
                          'qc7amUeAsqD_GTNu6YPtHbJopmH7Lwhre2QKS2QAXTo',
                        level: 0,
                        score: 0,
                        confidence: 1,
                        impact: 0,
                      },
                      {
                        evaluator:
                          '0YEMHuUL4_Bq3H3Rg0B1fn1cvvsQSi2A6QcBgq5Xp78',
                        level: null,
                        score: null,
                        confidence: 1,
                        impact: 0,
                      },
                      {
                        evaluator:
                          '-Z1Vjv3IQES9pPvMozgMGXkDUB2YFdcfkySl7Tf_VTY',
                        level: null,
                        score: null,
                        confidence: 1,
                        impact: 0,
                      },
                      {
                        evaluator:
                          'gP8ugEvnzdkfOOosRSoEgr4N0Z_--cIoVBtXPOQ51sQ',
                        level: null,
                        score: null,
                        confidence: 1,
                        impact: 0,
                      },
                      {
                        evaluator:
                          'jxwugksWF7gJS_DCLsUPG5rm4qTSSw6GbDKMCmnVj1E',
                        level: null,
                        score: null,
                        confidence: 1,
                        impact: 0,
                      },
                      {
                        evaluator:
                          'VURzTXXrHdhYjHCteK_iyn7q3UxNMuP2lZ7z_siLSO8',
                        level: null,
                        score: null,
                        confidence: 1,
                        impact: 0,
                      },
                      {
                        evaluator:
                          'IRfPAiw08wPgDyQRfJwSB7e3RkYm1So0YE-pzbSCAlA',
                        level: null,
                        score: null,
                        confidence: 1,
                        impact: 0,
                      },
                      {
                        evaluator:
                          '5Ao6UOzp0k0wXm2cNvbzEIyZuR8nZfqwUZj108MIbnw',
                        level: null,
                        score: null,
                        confidence: 1,
                        impact: 0,
                      },
                      {
                        evaluator:
                          'OJwy5dbrFcpWHMpHI-ii7ac_UW6LIXxrEqSYw8IMlDE',
                        level: null,
                        score: null,
                        confidence: 1,
                        impact: 0,
                      },
                      {
                        evaluator:
                          '0wT96mjCAje7If7qjUyrzkVYBPoLPu3tfOzesdT3ShE',
                        level: null,
                        score: null,
                        confidence: 1,
                        impact: 0,
                      },
                      {
                        evaluator:
                          'AsjAK5gJ68SMYvGfCAuROsMrJQ0_83ZS92xy94LlfIA',
                        level: 2,
                        score: 21564244.746546254,
                        confidence: 1,
                        impact: 21564244.746546254,
                      },
                      {
                        evaluator:
                          'v5mibmGr9W08lhCI1exZr4PLt4VV7s-nVoJXOVlN2kg',
                        level: 2,
                        score: 16176149.369096812,
                        confidence: 1,
                        impact: 16176149.369096812,
                      },
                      {
                        evaluator:
                          'I1Hz9L532aMra_RdzxUPh46bqrj4LUuHwuvSPLBwWbE',
                        level: 2,
                        score: 6399114.581736151,
                        confidence: 1,
                        impact: 6399114.581736151,
                      },
                      {
                        evaluator:
                          '5yq8pxbMDYWtrq_mvxgS-UOKaiHUyAM7sejnS30DyxE',
                        level: null,
                        score: null,
                        confidence: 1,
                        impact: 0,
                      },
                      {
                        evaluator:
                          'OeNllgD2Q2K845Z_ANwah_9yTbJ5PFpvyY8zITkOuFs',
                        level: 2,
                        score: 15485245.111662246,
                        confidence: 1,
                        impact: 15485245.111662246,
                      },
                    ],
                  },
                  {
                    name: 'subject',
                    score: 8968703784.433262,
                    level: 4,
                    impacts: [
                      {
                        evaluator:
                          'XMbTy7bVInrUsPTBCx45WLTFC92s1JRUPIhsu9Js1-4',
                        level: 3,
                        score: 63293570.70983915,
                        confidence: 2,
                        impact: 126587141.4196783,
                      },
                      {
                        evaluator:
                          'xqmMHQMnBdakxs3sXXjy7qVqPoXmhhwOt4c_z1tSPwM',
                        level: 3,
                        score: 283726707.50423574,
                        confidence: 3,
                        impact: 851180122.5127072,
                      },
                      {
                        evaluator:
                          '09w4r-qB7nfooRBN0_FmM9r5SwWfwpIn-x1rNTfE6IA',
                        level: 3,
                        score: 203002315.72423297,
                        confidence: 4,
                        impact: 812009262.8969319,
                      },
                      {
                        evaluator:
                          'VM-DY1Gpl6jvuxHjMRjt8eHDcUh1pxCj5KQXR2714yU',
                        level: 2,
                        score: 99915223.05616462,
                        confidence: 2,
                        impact: 199830446.11232924,
                      },
                      {
                        evaluator:
                          'pQU_kWrL6E7M3J9FIg4LLd0tBSwcPy7p8ziUe9cdrfo',
                        level: 1,
                        score: 97610002.27358976,
                        confidence: 3,
                        impact: 292830006.8207693,
                      },
                      {
                        evaluator:
                          'AWtJ0wj7j1sFkZStsh6n3UvXsX3pGj9Oqgw2xMF9B_Y',
                        level: 3,
                        score: 152720819.208647,
                        confidence: 3,
                        impact: 458162457.62594104,
                      },
                      {
                        evaluator:
                          '2R3F47LIjbBMtQUk3F7tJrGrbnYXuJ3QQ27BsT7BLNY',
                        level: 0,
                        score: 0,
                        confidence: 4,
                        impact: 0,
                      },
                      {
                        evaluator:
                          'e2ksY_5dZkxRpQ2Icxn4_xmdrS6ds5GnLJ0vjDu9Z8o',
                        level: 0,
                        score: 0,
                        confidence: 1,
                        impact: 0,
                      },
                      {
                        evaluator:
                          'd3l2wkj9ty1zjtGLd413ahp2iKDzQy5qFrtvAOerDAo',
                        level: 0,
                        score: 0,
                        confidence: 1,
                        impact: 0,
                      },
                      {
                        evaluator:
                          'YoXMIDKRcCgspz6yoaLy8ZO8G5EhfJC_q3rv1nECXsU',
                        level: null,
                        score: null,
                        confidence: 4,
                        impact: 0,
                      },
                      {
                        evaluator:
                          'UxYHGX4JtnUrYTZzVqbTLu9Azw5hAfDK1X7DLXp7_tQ',
                        level: 3,
                        score: 244479365.61455446,
                        confidence: 3,
                        impact: 733438096.8436635,
                      },
                      {
                        evaluator:
                          '4XbnWVYj5n3ge6PguwTfYzSC2MsfMJD5YFeaqpuo1EY',
                        level: null,
                        score: null,
                        confidence: 4,
                        impact: 0,
                      },
                      {
                        evaluator:
                          'rT3B4qMXIxgh33lmt3feWL-MP3nyBkx0r4DQT-yMm-Q',
                        level: 0,
                        score: 0,
                        confidence: 4,
                        impact: 0,
                      },
                      {
                        evaluator:
                          'JT1jXJcuTij0AdWV2h9ePM9ape7rk6Fhq-T7mpHUBbg',
                        level: 2,
                        score: 63759958.55310569,
                        confidence: 3,
                        impact: 191279875.65931708,
                      },
                      {
                        evaluator:
                          '7puQsSqow9VRNGDTdhg7NIBe7pvRaPWN-xWhgTvOLo8',
                        level: 3,
                        score: 180328724.67666632,
                        confidence: 2,
                        impact: 360657449.35333264,
                      },
                      {
                        evaluator:
                          '_UaulVdJPv0jkCBsjClNUlkfMMg0rQFAhYYDb_3B7yk',
                        level: 3,
                        score: 118378412.15031278,
                        confidence: 4,
                        impact: 473513648.6012511,
                      },
                      {
                        evaluator:
                          'HxZfz3ipSp0rHsOhJQlievFqjV3DnU8BE6vhqNSecBM',
                        level: 1,
                        score: 100652472.08204281,
                        confidence: 4,
                        impact: 402609888.32817125,
                      },
                      {
                        evaluator:
                          '1Ix6_UTI9FzFD9JVYeX7L-7P0cSt0uBEzoUBK_CL8QY',
                        level: 3,
                        score: 130206694.59939781,
                        confidence: 2,
                        impact: 260413389.19879562,
                      },
                      {
                        evaluator:
                          'qc7amUeAsqD_GTNu6YPtHbJopmH7Lwhre2QKS2QAXTo',
                        level: 3,
                        score: 35698356.1478921,
                        confidence: 4,
                        impact: 142793424.5915684,
                      },
                      {
                        evaluator:
                          '0YEMHuUL4_Bq3H3Rg0B1fn1cvvsQSi2A6QcBgq5Xp78',
                        level: 1,
                        score: 21097856.903279718,
                        confidence: 2,
                        impact: 42195713.806559436,
                      },
                      {
                        evaluator:
                          '-Z1Vjv3IQES9pPvMozgMGXkDUB2YFdcfkySl7Tf_VTY',
                        level: 0,
                        score: 0,
                        confidence: 4,
                        impact: 0,
                      },
                      {
                        evaluator:
                          'gP8ugEvnzdkfOOosRSoEgr4N0Z_--cIoVBtXPOQ51sQ',
                        level: null,
                        score: null,
                        confidence: 4,
                        impact: 0,
                      },
                      {
                        evaluator:
                          'jxwugksWF7gJS_DCLsUPG5rm4qTSSw6GbDKMCmnVj1E',
                        level: 0,
                        score: 0,
                        confidence: 4,
                        impact: 0,
                      },
                      {
                        evaluator:
                          'VURzTXXrHdhYjHCteK_iyn7q3UxNMuP2lZ7z_siLSO8',
                        level: 0,
                        score: 0,
                        confidence: 4,
                        impact: 0,
                      },
                      {
                        evaluator:
                          'IRfPAiw08wPgDyQRfJwSB7e3RkYm1So0YE-pzbSCAlA',
                        level: 1,
                        score: 49061216.23156212,
                        confidence: 3,
                        impact: 147183648.69468635,
                      },
                      {
                        evaluator:
                          '5Ao6UOzp0k0wXm2cNvbzEIyZuR8nZfqwUZj108MIbnw',
                        level: 0,
                        score: 0,
                        confidence: 1,
                        impact: 0,
                      },
                      {
                        evaluator:
                          'OJwy5dbrFcpWHMpHI-ii7ac_UW6LIXxrEqSYw8IMlDE',
                        level: 0,
                        score: 0,
                        confidence: 4,
                        impact: 0,
                      },
                      {
                        evaluator:
                          '0wT96mjCAje7If7qjUyrzkVYBPoLPu3tfOzesdT3ShE',
                        level: 1,
                        score: 73494066.39552891,
                        confidence: 4,
                        impact: 293976265.58211565,
                      },
                      {
                        evaluator:
                          'AsjAK5gJ68SMYvGfCAuROsMrJQ0_83ZS92xy94LlfIA',
                        level: 3,
                        score: 302332518.53370947,
                        confidence: 4,
                        impact: 1209330074.1348379,
                      },
                      {
                        evaluator:
                          'v5mibmGr9W08lhCI1exZr4PLt4VV7s-nVoJXOVlN2kg',
                        level: 3,
                        score: 301995876.24125063,
                        confidence: 4,
                        impact: 1207983504.9650025,
                      },
                      {
                        evaluator:
                          'I1Hz9L532aMra_RdzxUPh46bqrj4LUuHwuvSPLBwWbE',
                        level: 3,
                        score: 85790591.14291848,
                        confidence: 2,
                        impact: 171581182.28583696,
                      },
                      {
                        evaluator:
                          '5yq8pxbMDYWtrq_mvxgS-UOKaiHUyAM7sejnS30DyxE',
                        level: 0,
                        score: 0,
                        confidence: 4,
                        impact: 0,
                      },
                      {
                        evaluator:
                          'OeNllgD2Q2K845Z_ANwah_9yTbJ5PFpvyY8zITkOuFs',
                        level: 3,
                        score: 197049394.99992335,
                        confidence: 3,
                        impact: 591148184.99977,
                      },
                    ],
                  },
                ],
              },
            ],
          },
          {
            name: 'Seed',
            block: 30173280,
            timestamp: 1740433826884,
            hash: 'UakYx5N4mQ1GIaiE_AhcsgBs4hAneEGVkJqjN-6wg0Q',
          },
          {
            name: 'SeedConnected',
            rank: 13,
            connected: [
              'w4dNg2yUSuuMN_SfPBmqTbdNhk_nsFgwoO36ZUcDt88',
              'GYGbx74q6-pYRG4UHNfrMVyZ6ZIZQYUCSHhlBGkvBjE',
              'ufl4PdK91Qf_1Efb61chYN6Sa6BZjU8mjPSqBbrDhDk',
              '---U49atc2d-z0HFP_0-qeml3rsj_I7Nsd7QA5aP7mc',
              'weKyDO9uEPz-KzO13IupiCzT40fgKhETD2kKuX3ZoqA',
              'JUg3dZMqyyhX0il6Q9TSQQeUWNbTz6USO6f6boyyLHY',
              'PbtXC7NF5bhiyrDoCShlg3iKK3d9bto_uxg9B4BGv9E',
              'hWIVtbx4VcSVAY1_r1bIH66QvS9RNFXJWGKTy_c5qxY',
              'aM4xs1M1MB42ApdYrEQyOBQX2hzdsSGHZ1oiXPq6K5A',
              'vPmP-pkagrl02LrGgIaFf4aimR4rTrbnIcYT5t7q2w4',
              'bSGdH_RTE9CbHvBpx3Y08OUE0cw7fexp7y0M-9pD4S0',
              'jutFlbXP0eJnJ2sPT8aibSYdYVde9XQZ_i-z96N9r1w',
              'sVYW_wqVAxaoT2K1Va9duLjQ1jmgnUuvVP82bPDrAL8',
            ],
            communities: [
              'w4dNg2yUSuuMN_SfPBmqTbdNhk_nsFgwoO36ZUcDt88',
              'GYGbx74q6-pYRG4UHNfrMVyZ6ZIZQYUCSHhlBGkvBjE',
              'ufl4PdK91Qf_1Efb61chYN6Sa6BZjU8mjPSqBbrDhDk',
              '---U49atc2d-z0HFP_0-qeml3rsj_I7Nsd7QA5aP7mc',
              'weKyDO9uEPz-KzO13IupiCzT40fgKhETD2kKuX3ZoqA',
              'JUg3dZMqyyhX0il6Q9TSQQeUWNbTz6USO6f6boyyLHY',
              'PbtXC7NF5bhiyrDoCShlg3iKK3d9bto_uxg9B4BGv9E',
              'hWIVtbx4VcSVAY1_r1bIH66QvS9RNFXJWGKTy_c5qxY',
              'aM4xs1M1MB42ApdYrEQyOBQX2hzdsSGHZ1oiXPq6K5A',
              'vPmP-pkagrl02LrGgIaFf4aimR4rTrbnIcYT5t7q2w4',
              'bSGdH_RTE9CbHvBpx3Y08OUE0cw7fexp7y0M-9pD4S0',
              'jutFlbXP0eJnJ2sPT8aibSYdYVde9XQZ_i-z96N9r1w',
              'sVYW_wqVAxaoT2K1Va9duLjQ1jmgnUuvVP82bPDrAL8',
              'Pr5SHCQkGvSc',
              'Tf6Wtwlhjy3gydBvGsdPgVH0ttZXM-SOeFZIZePvZdg',
            ],
            reported: [],
            block: 30173280,
            timestamp: 1740433832840,
            hash: 'kLp-MHmpgDQg9_sgHnoviuMITA0nEJjFmSnGwh4BuPE',
          },
          {
            name: 'SeedConnectedWithFriend',
            friend: null,
            block: 30173280,
            timestamp: 1740433850176,
            hash: 'Tv4O0cLDVoGkT4Mluj4PypUe9HMtMlR5Ym7InJBVz6k',
          },
          {
            name: 'BrightID',
            block: 30173280,
            timestamp: 1740433855224,
            hash: 'S2984iNS-UoMl9QkfoB7ZJqn62GdJC7od7_W2dQJJmA',
          },
          {
            name: 'SocialRecoverySetup',
            block: 30173280,
            timestamp: 1740433872753,
            hash: 'tKc0-RAm9BR_YFK5dB1uLhHsI5zmhwn9mg96pzNPd4U',
          },
          {
            name: 'Bitu',
            releaseTime: 1653882066611,
            linksNum: 61,
            confirmedScore: 61,
            directReports: {},
            indirectReports: {},
            reportedConnections: {},
            score: 60,
            block: 30173280,
            timestamp: 1740433875234,
            hash: 'ZxrxpAIdQLN2rpEw65xvEdb76YuH0AHzwGkbNTVXl4A',
          },
        ],
      },
      {
        id: '9vBrFxhV0bBzKqwh11Z6WqoNLecgk4s5KZHbF0vTeKQ',
        level: 'just met',
        reportReason: null,
        timestamp: 1615891846818,
        verifications: [
          {
            name: 'SeedConnected',
            rank: 1,
            connected: ['Tf6Wtwlhjy3gydBvGsdPgVH0ttZXM-SOeFZIZePvZdg'],
            communities: ['Tf6Wtwlhjy3gydBvGsdPgVH0ttZXM-SOeFZIZePvZdg'],
            reported: [],
            block: 30173280,
            timestamp: 1740433832184,
            hash: 'B5-uDr82vnV0kKIYXVm0qsEwWr3-7D4OUmcsWeLpiH4',
          },
          {
            name: 'BrightID',
            block: 30173280,
            timestamp: 1740433854707,
            hash: '1HA9W55oagnKgyx9VaDP6eRcL_UFTFjTHTmT3VbioZM',
          },
        ],
      },
      {
        id: 'TZHz5ln0D9zz7HltfWFxitGmgHFwt1ugoynp4otS4Hc',
        level: 'just met',
        reportReason: null,
        timestamp: 1615891846818,
        verifications: [
          {
            name: 'SeedConnected',
            rank: 1,
            connected: ['2HNIxBhIp-m-BZR15o9JS2BluR5u57sL8flDSXoizBg'],
            communities: ['2HNIxBhIp-m-BZR15o9JS2BluR5u57sL8flDSXoizBg'],
            reported: [],
            block: 30173280,
            timestamp: 1740433832018,
            hash: 'ObVLYqw8bEcqD49O30-cOjX3KCQl5EXn6MaURIV_7Pk',
          },
          {
            name: 'BrightID',
            block: 30173280,
            timestamp: 1740433854507,
            hash: 'yWUCbgOsXg7GkUFyUeVupA8pYhAYo4Nvo_hK6S64YKQ',
          },
        ],
      },
      {
        id: 'NoX5TH5ol5pnKP8RZAXhXeF9WNtXpXIO4XXe7jdiS9I',
        level: 'just met',
        reportReason: null,
        timestamp: 1615891846818,
        verifications: [
          {
            name: 'SeedConnected',
            rank: 1,
            connected: ['2HNIxBhIp-m-BZR15o9JS2BluR5u57sL8flDSXoizBg'],
            communities: ['2HNIxBhIp-m-BZR15o9JS2BluR5u57sL8flDSXoizBg'],
            reported: [],
            block: 30173280,
            timestamp: 1740433832018,
            hash: 'xwnaE4QGXmg1AYlrEouX-QZ1h9nRgSIC8IY55cMTgoI',
          },
          {
            name: 'BrightID',
            block: 30173280,
            timestamp: 1740433854507,
            hash: '0o0CFG9aNp0BblIW_nGWItabfK7O_ueCMb_aDD8A6C8',
          },
        ],
      },
      {
        id: '-ZYddr5SF5BrY2mDQQVzZbhcuWttogIzGKiCkwQhtK4',
        level: 'already known',
        reportReason: null,
        timestamp: 1632168837000,
        verifications: [
          {
            name: 'SeedConnected',
            rank: 1,
            connected: ['ufl4PdK91Qf_1Efb61chYN6Sa6BZjU8mjPSqBbrDhDk'],
            communities: ['ufl4PdK91Qf_1Efb61chYN6Sa6BZjU8mjPSqBbrDhDk'],
            reported: [],
            block: 30173280,
            timestamp: 1740433832844,
            hash: 'LP1RZJ0X_FagMz6-LA8RRG4jEYGgOaubqPqmTRfiU30',
          },
          {
            name: 'BrightID',
            block: 30173280,
            timestamp: 1740433855228,
            hash: 'Hf-H_Q8CeouwHiTapWqnYfMJR0Rlu96xc9H0ngFFgr8',
          },
          {
            name: 'SocialRecoverySetup',
            block: 30173280,
            timestamp: 1740433870265,
            hash: 'bH9JYgi6yepatP0FnD0gNLbzLFP2VwCHFvoHbKE6F8A',
          },
        ],
      },
      {
        id: 'Jm1tqsaWUX47E-m_RjkxX0pAf9UUn37ohguOkVaL8FY',
        level: 'already known',
        reportReason: null,
        timestamp: 1634146984000,
        verifications: [
          {
            name: 'Aura',
            block: 30173280,
            timestamp: 1740433826802,
            domains: [
              {
                name: 'BrightID',
                categories: [
                  {
                    name: 'player',
                    score: 0,
                    level: 0,
                    impacts: [
                      {
                        evaluator:
                          'HxZfz3ipSp0rHsOhJQlievFqjV3DnU8BE6vhqNSecBM',
                        level: null,
                        score: null,
                        confidence: 1,
                        impact: 0,
                      },
                    ],
                  },
                  {
                    name: 'subject',
                    score: 402609888.32817125,
                    level: 2,
                    impacts: [
                      {
                        evaluator:
                          'HxZfz3ipSp0rHsOhJQlievFqjV3DnU8BE6vhqNSecBM',
                        level: 1,
                        score: 100652472.08204281,
                        confidence: 4,
                        impact: 402609888.32817125,
                      },
                    ],
                  },
                ],
              },
            ],
          },
          {
            name: 'SeedConnected',
            rank: 3,
            connected: [
              'w4dNg2yUSuuMN_SfPBmqTbdNhk_nsFgwoO36ZUcDt88',
              'sVYW_wqVAxaoT2K1Va9duLjQ1jmgnUuvVP82bPDrAL8',
              'ufl4PdK91Qf_1Efb61chYN6Sa6BZjU8mjPSqBbrDhDk',
            ],
            communities: [
              'w4dNg2yUSuuMN_SfPBmqTbdNhk_nsFgwoO36ZUcDt88',
              'sVYW_wqVAxaoT2K1Va9duLjQ1jmgnUuvVP82bPDrAL8',
              'ufl4PdK91Qf_1Efb61chYN6Sa6BZjU8mjPSqBbrDhDk',
              '3vqWfpOxP2fR',
              'Pr5SHCQkGvSc',
            ],
            reported: [],
            block: 30173280,
            timestamp: 1740433832006,
            hash: 'SAmxSn7EYd8w9Um2a987kddyrR4TK8fxfP1375aPZkA',
          },
          {
            name: 'SeedConnectedWithFriend',
            friend: 'HZgquyVgq1HIaPTBc19xcfHUZdiNatsSmEfQXNWYtUA',
            block: 30173280,
            timestamp: 1740433850284,
            hash: 'T093h3xqTPw3n9vN7-mLpb92L5GgvD0boatA4WoGgm8',
          },
          {
            name: 'BrightID',
            block: 30173280,
            timestamp: 1740433854493,
            hash: 'wbJyILlqAihlFpu4vfykQo8rcqgSDBhZCqembvNMjLU',
          },
          {
            name: 'SocialRecoverySetup',
            block: 30173280,
            timestamp: 1740433872552,
            hash: 'kpo9lEenToLNnnQKyqovFWVyvvNrEr3J--pWyVuK6iU',
          },
          {
            name: 'Bitu',
            releaseTime: 1653882066611,
            linksNum: 16,
            confirmedScore: 16,
            directReports: {},
            indirectReports: {},
            reportedConnections: {},
            score: 0,
            block: 30173280,
            timestamp: 1740433875239,
            hash: '_W0fHT3H_4sugojT0ZWNyspZSfa2Qvsk5njB-fAFHSs',
          },
        ],
      },
      {
        id: '0wT96mjCAje7If7qjUyrzkVYBPoLPu3tfOzesdT3ShE',
        level: 'recovery',
        reportReason: null,
        timestamp: 1637397896000,
        verifications: [
          {
            name: 'Aura',
            block: 30173280,
            timestamp: 1740433826802,
            domains: [
              {
                name: 'BrightID',
                categories: [
                  {
                    name: 'player',
                    score: 73494066.39552891,
                    level: 1,
                    impacts: [
                      {
                        evaluator:
                          '7puQsSqow9VRNGDTdhg7NIBe7pvRaPWN-xWhgTvOLo8',
                        level: 2,
                        score: 2953198.095071988,
                        confidence: 1,
                        impact: 2953198.095071988,
                      },
                      {
                        evaluator:
                          'HxZfz3ipSp0rHsOhJQlievFqjV3DnU8BE6vhqNSecBM',
                        level: null,
                        score: null,
                        confidence: 1,
                        impact: 0,
                      },
                      {
                        evaluator:
                          '1Ix6_UTI9FzFD9JVYeX7L-7P0cSt0uBEzoUBK_CL8QY',
                        level: 2,
                        score: 11702617.28153414,
                        confidence: 1,
                        impact: 11702617.28153414,
                      },
                      {
                        evaluator:
                          'AsjAK5gJ68SMYvGfCAuROsMrJQ0_83ZS92xy94LlfIA',
                        level: 2,
                        score: 21564244.746546254,
                        confidence: 1,
                        impact: 21564244.746546254,
                      },
                      {
                        evaluator:
                          'v5mibmGr9W08lhCI1exZr4PLt4VV7s-nVoJXOVlN2kg',
                        level: 2,
                        score: 16176149.369096812,
                        confidence: 1,
                        impact: 16176149.369096812,
                      },
                      {
                        evaluator:
                          'xqmMHQMnBdakxs3sXXjy7qVqPoXmhhwOt4c_z1tSPwM',
                        level: 2,
                        score: 21097856.903279718,
                        confidence: 1,
                        impact: 21097856.903279718,
                      },
                    ],
                  },
                  {
                    name: 'subject',
                    score: 7065753351.441394,
                    level: 4,
                    impacts: [
                      {
                        evaluator:
                          'AWtJ0wj7j1sFkZStsh6n3UvXsX3pGj9Oqgw2xMF9B_Y',
                        level: 3,
                        score: 152720819.208647,
                        confidence: 4,
                        impact: 610883276.834588,
                      },
                      {
                        evaluator:
                          's56WKMXMz5TdXdCYVO1XKekrWo-jYhODN6GFH9QdhwE',
                        level: 3,
                        score: 134867285.85970923,
                        confidence: 4,
                        impact: 539469143.4388369,
                      },
                      {
                        evaluator:
                          '09w4r-qB7nfooRBN0_FmM9r5SwWfwpIn-x1rNTfE6IA',
                        level: 3,
                        score: 203002315.72423297,
                        confidence: 4,
                        impact: 812009262.8969319,
                      },
                      {
                        evaluator:
                          'W8-lKWk_gHGXSEMwjCTy_c7XjAv61QgzVBrz29eqm_Y',
                        level: 0,
                        score: 0,
                        confidence: 2,
                        impact: 0,
                      },
                      {
                        evaluator:
                          'UxYHGX4JtnUrYTZzVqbTLu9Azw5hAfDK1X7DLXp7_tQ',
                        level: 3,
                        score: 244479365.61455446,
                        confidence: 4,
                        impact: 977917462.4582179,
                      },
                      {
                        evaluator:
                          '7puQsSqow9VRNGDTdhg7NIBe7pvRaPWN-xWhgTvOLo8',
                        level: 3,
                        score: 180328724.67666632,
                        confidence: 2,
                        impact: 360657449.35333264,
                      },
                      {
                        evaluator:
                          'HxZfz3ipSp0rHsOhJQlievFqjV3DnU8BE6vhqNSecBM',
                        level: 1,
                        score: 100652472.08204281,
                        confidence: 4,
                        impact: 402609888.32817125,
                      },
                      {
                        evaluator:
                          '1Ix6_UTI9FzFD9JVYeX7L-7P0cSt0uBEzoUBK_CL8QY',
                        level: 3,
                        score: 130206694.59939781,
                        confidence: 3,
                        impact: 390620083.79819345,
                      },
                      {
                        evaluator:
                          'AsjAK5gJ68SMYvGfCAuROsMrJQ0_83ZS92xy94LlfIA',
                        level: 3,
                        score: 302332518.53370947,
                        confidence: 3,
                        impact: 906997555.6011283,
                      },
                      {
                        evaluator:
                          'v5mibmGr9W08lhCI1exZr4PLt4VV7s-nVoJXOVlN2kg',
                        level: 3,
                        score: 301995876.24125063,
                        confidence: 3,
                        impact: 905987628.7237519,
                      },
                      {
                        evaluator:
                          'xqmMHQMnBdakxs3sXXjy7qVqPoXmhhwOt4c_z1tSPwM',
                        level: 3,
                        score: 283726707.50423574,
                        confidence: 2,
                        impact: 567453415.0084715,
                      },
                      {
                        evaluator:
                          'OeNllgD2Q2K845Z_ANwah_9yTbJ5PFpvyY8zITkOuFs',
                        level: 3,
                        score: 197049394.99992335,
                        confidence: 3,
                        impact: 591148184.99977,
                      },
                    ],
                  },
                ],
              },
            ],
          },
          {
            name: 'Seed',
            block: 30173280,
            timestamp: 1740433826884,
            hash: 'kA_eRD0mbynglqaDpMDEEfOQil93uHSphKwTuWa9EOA',
          },
          {
            name: 'SeedConnected',
            rank: 10,
            connected: [
              'Pr5SHCQkGvSc',
              'weKyDO9uEPz-KzO13IupiCzT40fgKhETD2kKuX3ZoqA',
              'GYGbx74q6-pYRG4UHNfrMVyZ6ZIZQYUCSHhlBGkvBjE',
              'ufl4PdK91Qf_1Efb61chYN6Sa6BZjU8mjPSqBbrDhDk',
              '---U49atc2d-z0HFP_0-qeml3rsj_I7Nsd7QA5aP7mc',
              'hWIVtbx4VcSVAY1_r1bIH66QvS9RNFXJWGKTy_c5qxY',
              'PbtXC7NF5bhiyrDoCShlg3iKK3d9bto_uxg9B4BGv9E',
              'jutFlbXP0eJnJ2sPT8aibSYdYVde9XQZ_i-z96N9r1w',
              'sVYW_wqVAxaoT2K1Va9duLjQ1jmgnUuvVP82bPDrAL8',
              'lQ1kMUbQXuIW_2c_WxF5f6Ko8Gqg6eVaWuu9cQjZkYQ',
            ],
            communities: [
              'Pr5SHCQkGvSc',
              'weKyDO9uEPz-KzO13IupiCzT40fgKhETD2kKuX3ZoqA',
              'GYGbx74q6-pYRG4UHNfrMVyZ6ZIZQYUCSHhlBGkvBjE',
              'ufl4PdK91Qf_1Efb61chYN6Sa6BZjU8mjPSqBbrDhDk',
              '---U49atc2d-z0HFP_0-qeml3rsj_I7Nsd7QA5aP7mc',
              'hWIVtbx4VcSVAY1_r1bIH66QvS9RNFXJWGKTy_c5qxY',
              'PbtXC7NF5bhiyrDoCShlg3iKK3d9bto_uxg9B4BGv9E',
              'jutFlbXP0eJnJ2sPT8aibSYdYVde9XQZ_i-z96N9r1w',
              'sVYW_wqVAxaoT2K1Va9duLjQ1jmgnUuvVP82bPDrAL8',
              'lQ1kMUbQXuIW_2c_WxF5f6Ko8Gqg6eVaWuu9cQjZkYQ',
              'Tf6Wtwlhjy3gydBvGsdPgVH0ttZXM-SOeFZIZePvZdg',
            ],
            reported: [],
            block: 30173280,
            timestamp: 1740433832835,
            hash: 'KtEocUuV4TbaJ0B4WP3G0Wba7zqsW1hvSOdFwDV05qc',
          },
          {
            name: 'SeedConnectedWithFriend',
            friend: null,
            block: 30173280,
            timestamp: 1740433850175,
            hash: 'CQbsRiQSH6jDJBPgm0W1dyErQzDY2TFN6GTg181RZ3k',
          },
          {
            name: 'BrightID',
            block: 30173280,
            timestamp: 1740433855220,
            hash: '2HQgyzx9YvwVkzGCtBHOiGT2fKMZBJXxzBvsfA0c0PE',
          },
          {
            name: 'SocialRecoverySetup',
            block: 30173280,
            timestamp: 1740433870437,
            hash: '2KyRKsLKhDB-8uYOoUkWOs6EQYQynO7AELXND8oo_94',
          },
          {
            name: 'Bitu',
            releaseTime: 1653882066611,
            linksNum: 49,
            confirmedScore: 46,
            directReports: {},
            indirectReports: {
              zDi6kJaO3JKkv8e72Q9u7rdecPYkzfb6a2lOxJaDZHE: -1,
              TUnr9EjYPpUITRR3k5my7aGWghdv_Hdi3jVv15P1N3k: -2,
            },
            reportedConnections: {
              zDi6kJaO3JKkv8e72Q9u7rdecPYkzfb6a2lOxJaDZHE: [
                'frLHtQ0nk-vgd99BAK9y-PLnN0UsO3FPrNs-Db-i9K8',
              ],
              TUnr9EjYPpUITRR3k5my7aGWghdv_Hdi3jVv15P1N3k: [
                'x8D-HX9bljRsxu0mWkVzMOJlyHmffQvnPrG9I-HTJbQ',
                'frLHtQ0nk-vgd99BAK9y-PLnN0UsO3FPrNs-Db-i9K8',
              ],
            },
            score: 21,
            block: 30173280,
            timestamp: 1740433875234,
            hash: 'yGCzuRoX37SPEkb8R1ldUPnX0yJHqyOSU_t2NIWHomQ',
          },
        ],
      },
      {
        id: 's56WKMXMz5TdXdCYVO1XKekrWo-jYhODN6GFH9QdhwE',
        level: 'recovery',
        reportReason: null,
        timestamp: 1637397921000,
        verifications: [
          {
            name: 'Aura',
            block: 30173280,
            timestamp: 1740433826802,
            domains: [
              {
                name: 'BrightID',
                categories: [
                  {
                    name: 'player',
                    score: 134867285.85970923,
                    level: 3,
                    impacts: [
                      {
                        evaluator:
                          'HxZfz3ipSp0rHsOhJQlievFqjV3DnU8BE6vhqNSecBM',
                        level: null,
                        score: null,
                        confidence: 1,
                        impact: 0,
                      },
                      {
                        evaluator:
                          '1Ix6_UTI9FzFD9JVYeX7L-7P0cSt0uBEzoUBK_CL8QY',
                        level: 2,
                        score: 11702617.28153414,
                        confidence: 1,
                        impact: 11702617.28153414,
                      },
                      {
                        evaluator:
                          'ER-WJw5P6BUgmwdzg3IqlNtoU-NdftD3eukVaGW40j0',
                        level: null,
                        score: null,
                        confidence: 1,
                        impact: 0,
                      },
                      {
                        evaluator:
                          'AsjAK5gJ68SMYvGfCAuROsMrJQ0_83ZS92xy94LlfIA',
                        level: 2,
                        score: 21564244.746546254,
                        confidence: 1,
                        impact: 21564244.746546254,
                      },
                      {
                        evaluator:
                          'AI04PW5ABmwQ5K_tR52ymbB7Hni1VXtaQ6FZaCQfU4U',
                        level: null,
                        score: null,
                        confidence: 1,
                        impact: 0,
                      },
                      {
                        evaluator:
                          '3Oz-Gq2kEA_GSg6--vHNAbgZnbQ8Ryf9xPIFksn8XXU',
                        level: null,
                        score: null,
                        confidence: 1,
                        impact: 0,
                      },
                      {
                        evaluator:
                          'HsKfPmmRtoaws5CQd44Z8u6FhtftTESyL_Q1HT30htQ',
                        level: 2,
                        score: 7108554.950436223,
                        confidence: 4,
                        impact: 28434219.801744893,
                      },
                      {
                        evaluator:
                          'OeNllgD2Q2K845Z_ANwah_9yTbJ5PFpvyY8zITkOuFs',
                        level: 2,
                        score: 15485245.111662246,
                        confidence: 2,
                        impact: 30970490.223324493,
                      },
                      {
                        evaluator:
                          'xqmMHQMnBdakxs3sXXjy7qVqPoXmhhwOt4c_z1tSPwM',
                        level: 2,
                        score: 21097856.903279718,
                        confidence: 2,
                        impact: 42195713.806559436,
                      },
                    ],
                  },
                  {
                    name: 'subject',
                    score: 5994896377.819347,
                    level: 4,
                    impacts: [
                      {
                        evaluator:
                          'frVVRCFkvHNjdAVcNs_ZzTd4Xz-rGTyPW1AeCrNsHN4',
                        level: 3,
                        score: 76395351.5211729,
                        confidence: 4,
                        impact: 305581406.0846916,
                      },
                      {
                        evaluator:
                          'AWtJ0wj7j1sFkZStsh6n3UvXsX3pGj9Oqgw2xMF9B_Y',
                        level: 3,
                        score: 152720819.208647,
                        confidence: 4,
                        impact: 610883276.834588,
                      },
                      {
                        evaluator:
                          '09w4r-qB7nfooRBN0_FmM9r5SwWfwpIn-x1rNTfE6IA',
                        level: 3,
                        score: 203002315.72423297,
                        confidence: 4,
                        impact: 812009262.8969319,
                      },
                      {
                        evaluator:
                          'W8-lKWk_gHGXSEMwjCTy_c7XjAv61QgzVBrz29eqm_Y',
                        level: 0,
                        score: 0,
                        confidence: 4,
                        impact: 0,
                      },
                      {
                        evaluator:
                          'UxYHGX4JtnUrYTZzVqbTLu9Azw5hAfDK1X7DLXp7_tQ',
                        level: 3,
                        score: 244479365.61455446,
                        confidence: 3,
                        impact: 733438096.8436635,
                      },
                      {
                        evaluator:
                          'HxZfz3ipSp0rHsOhJQlievFqjV3DnU8BE6vhqNSecBM',
                        level: 1,
                        score: 100652472.08204281,
                        confidence: 4,
                        impact: 402609888.32817125,
                      },
                      {
                        evaluator:
                          '1Ix6_UTI9FzFD9JVYeX7L-7P0cSt0uBEzoUBK_CL8QY',
                        level: 3,
                        score: 130206694.59939781,
                        confidence: 3,
                        impact: 390620083.79819345,
                      },
                      {
                        evaluator:
                          'ER-WJw5P6BUgmwdzg3IqlNtoU-NdftD3eukVaGW40j0',
                        level: 1,
                        score: 42662101.649825975,
                        confidence: 4,
                        impact: 170648406.5993039,
                      },
                      {
                        evaluator:
                          'AsjAK5gJ68SMYvGfCAuROsMrJQ0_83ZS92xy94LlfIA',
                        level: 3,
                        score: 302332518.53370947,
                        confidence: 3,
                        impact: 906997555.6011283,
                      },
                      {
                        evaluator:
                          'AI04PW5ABmwQ5K_tR52ymbB7Hni1VXtaQ6FZaCQfU4U',
                        level: null,
                        score: null,
                        confidence: 4,
                        impact: 0,
                      },
                      {
                        evaluator:
                          '3Oz-Gq2kEA_GSg6--vHNAbgZnbQ8Ryf9xPIFksn8XXU',
                        level: null,
                        score: null,
                        confidence: 4,
                        impact: 0,
                      },
                      {
                        evaluator:
                          'HsKfPmmRtoaws5CQd44Z8u6FhtftTESyL_Q1HT30htQ',
                        level: 3,
                        score: 104207372.08003037,
                        confidence: 4,
                        impact: 416829488.32012147,
                      },
                      {
                        evaluator:
                          'OeNllgD2Q2K845Z_ANwah_9yTbJ5PFpvyY8zITkOuFs',
                        level: 3,
                        score: 197049394.99992335,
                        confidence: 2,
                        impact: 394098789.9998467,
                      },
                      {
                        evaluator:
                          'xqmMHQMnBdakxs3sXXjy7qVqPoXmhhwOt4c_z1tSPwM',
                        level: 3,
                        score: 283726707.50423574,
                        confidence: 3,
                        impact: 851180122.5127072,
                      },
                    ],
                  },
                ],
              },
            ],
          },
          {
            name: 'Seed',
            block: 30173280,
            timestamp: 1740433826884,
            hash: 'V90gJwQWd9Jd7iNOULOqq9-TzKoX0KZ65sUW0uMJRl4',
          },
          {
            name: 'SeedConnected',
            rank: 12,
            connected: [
              'Pr5SHCQkGvSc',
              'ufl4PdK91Qf_1Efb61chYN6Sa6BZjU8mjPSqBbrDhDk',
              '---U49atc2d-z0HFP_0-qeml3rsj_I7Nsd7QA5aP7mc',
              'GYGbx74q6-pYRG4UHNfrMVyZ6ZIZQYUCSHhlBGkvBjE',
              'hWIVtbx4VcSVAY1_r1bIH66QvS9RNFXJWGKTy_c5qxY',
              'PbtXC7NF5bhiyrDoCShlg3iKK3d9bto_uxg9B4BGv9E',
              'bSGdH_RTE9CbHvBpx3Y08OUE0cw7fexp7y0M-9pD4S0',
              'sVYW_wqVAxaoT2K1Va9duLjQ1jmgnUuvVP82bPDrAL8',
              'jutFlbXP0eJnJ2sPT8aibSYdYVde9XQZ_i-z96N9r1w',
              'lQ1kMUbQXuIW_2c_WxF5f6Ko8Gqg6eVaWuu9cQjZkYQ',
              '8k0uJqf0wtapuC4K2aLPCk9IUe5fv_w33gt5twFI6Go',
              'qOKewbkPJTnu7rVAA8j3NTCt7EaBZ5fm_cJfEqCHTas',
            ],
            communities: [
              'Pr5SHCQkGvSc',
              'ufl4PdK91Qf_1Efb61chYN6Sa6BZjU8mjPSqBbrDhDk',
              '---U49atc2d-z0HFP_0-qeml3rsj_I7Nsd7QA5aP7mc',
              'GYGbx74q6-pYRG4UHNfrMVyZ6ZIZQYUCSHhlBGkvBjE',
              'hWIVtbx4VcSVAY1_r1bIH66QvS9RNFXJWGKTy_c5qxY',
              'PbtXC7NF5bhiyrDoCShlg3iKK3d9bto_uxg9B4BGv9E',
              'bSGdH_RTE9CbHvBpx3Y08OUE0cw7fexp7y0M-9pD4S0',
              'sVYW_wqVAxaoT2K1Va9duLjQ1jmgnUuvVP82bPDrAL8',
              'Tf6Wtwlhjy3gydBvGsdPgVH0ttZXM-SOeFZIZePvZdg',
              '-z6lbLFK4yxj1YmrUz7dYttceEg1XWZRoD_V8xE8qC0',
              '3vqWfpOxP2fR',
              'Dbu8rcx59Cml',
              'ETxf2qlnq4Kh',
              'mKkG_Vk0fOoy',
              'oD8jAEuJx1NuNuZnb4AkHiJPtQDn0fIApyHjimFsS6I',
              'f7koQjPrKUaFTBjwW3-AT1o9TRQFfTk0STNHuKi-b8M',
              '8k0uJqf0wtapuC4K2aLPCk9IUe5fv_w33gt5twFI6Go',
              'qOKewbkPJTnu7rVAA8j3NTCt7EaBZ5fm_cJfEqCHTas',
              'jutFlbXP0eJnJ2sPT8aibSYdYVde9XQZ_i-z96N9r1w',
              'lQ1kMUbQXuIW_2c_WxF5f6Ko8Gqg6eVaWuu9cQjZkYQ',
            ],
            reported: [],
            block: 30173280,
            timestamp: 1740433832835,
            hash: 'k1rmWrdefn8byYh5Q3-rAlV-wRTzHPH6eyOV6bRPcSw',
          },
          {
            name: 'SeedConnectedWithFriend',
            friend: null,
            block: 30173280,
            timestamp: 1740433850176,
            hash: 'pAm8myNYKvV7SPce078fYgQ48gCZ6aDOsLu8PwdLYRI',
          },
          {
            name: 'BrightID',
            block: 30173280,
            timestamp: 1740433855220,
            hash: 'o1tfuv67zBRgnQK-QOBU-xJ_9kyf2ipB0cqunI0Dzxg',
          },
          {
            name: 'SocialRecoverySetup',
            block: 30173280,
            timestamp: 1740433873788,
            hash: '-NI5dER23D5BQkueKcqmJ5AbG7Q1t7Ze94QD_orxeks',
          },
          {
            name: 'Bitu',
            releaseTime: 1653882066611,
            linksNum: 57,
            confirmedScore: 56,
            directReports: {},
            indirectReports: {
              ShWqKn_CoxuNl3slAJ_krl8vEI7qqJ8sSNBfN8X9h5Q: -1,
            },
            reportedConnections: {
              ShWqKn_CoxuNl3slAJ_krl8vEI7qqJ8sSNBfN8X9h5Q: [
                'frLHtQ0nk-vgd99BAK9y-PLnN0UsO3FPrNs-Db-i9K8',
              ],
            },
            score: 25,
            block: 30173280,
            timestamp: 1740433875234,
            hash: 'P_R5Z7zBzF69g7YhLLg2JXxbLAz2QoB0OfkVKDswf38',
          },
        ],
      },
      {
        id: 'zDvaPKaQ1BIXQRhznHo7-SIeVaXweVXadgsAY4fQ4yk',
        level: 'already known',
        reportReason: null,
        timestamp: 1637397956000,
        verifications: [
          {
            name: 'Aura',
            block: 30173280,
            timestamp: 1740433826802,
            domains: [
              {
                name: 'BrightID',
                categories: [
                  {
                    name: 'subject',
                    score: 539469143.4388369,
                    level: 4,
                    impacts: [
                      {
                        evaluator:
                          's56WKMXMz5TdXdCYVO1XKekrWo-jYhODN6GFH9QdhwE',
                        level: 3,
                        score: 134867285.85970923,
                        confidence: 4,
                        impact: 539469143.4388369,
                      },
                    ],
                  },
                ],
              },
            ],
          },
          {
            name: 'SeedConnected',
            rank: 3,
            connected: [
              'Pr5SHCQkGvSc',
              'sVYW_wqVAxaoT2K1Va9duLjQ1jmgnUuvVP82bPDrAL8',
              'ufl4PdK91Qf_1Efb61chYN6Sa6BZjU8mjPSqBbrDhDk',
            ],
            communities: [
              'Pr5SHCQkGvSc',
              'sVYW_wqVAxaoT2K1Va9duLjQ1jmgnUuvVP82bPDrAL8',
              'ufl4PdK91Qf_1Efb61chYN6Sa6BZjU8mjPSqBbrDhDk',
            ],
            reported: [],
            block: 30173280,
            timestamp: 1740433832835,
            hash: 'BBe5mqgoDiac7HSpbKUHisfz2ztAskTElokZ7qzhQ8A',
          },
          {
            name: 'SeedConnectedWithFriend',
            friend: 'KxA05pxB5unYBibNh9iud6j6O3nqoVtpfcuS5nBUWeo',
            block: 30173280,
            timestamp: 1740433850170,
            hash: 'OouN0PuasgdS9h9BsA7KmG6JxR4fmhHr12JZ59ROzXw',
          },
          {
            name: 'BrightID',
            block: 30173280,
            timestamp: 1740433855220,
            hash: 'yEse9Sw3nLbZ6yT7wZDJR_zsTcAzPOBkSb-OgE5hX2c',
          },
          {
            name: 'SocialRecoverySetup',
            block: 30173280,
            timestamp: 1740433874807,
            hash: 'vAjh1pY93mRtTSSDP6zq-Gso8F_sejEkHV_q8RodVy4',
          },
          {
            name: 'Bitu',
            releaseTime: 1653882066611,
            linksNum: 13,
            confirmedScore: 13,
            directReports: {},
            indirectReports: {},
            reportedConnections: {},
            score: 0,
            block: 30173280,
            timestamp: 1740433875238,
            hash: 'KNwq2S98tvydm-4tM1YuWFpt937QLYgD8cyIrltGNjg',
          },
        ],
      },
      {
        id: 'aYb75g6vShlTfcJf5_FudGiC9H6QoywZDR2ZoTtDTZI',
        level: 'already known',
        reportReason: null,
        timestamp: 1637397956000,
        verifications: [
          {
            name: 'SeedConnected',
            rank: 2,
            connected: [
              'ufl4PdK91Qf_1Efb61chYN6Sa6BZjU8mjPSqBbrDhDk',
              'sVYW_wqVAxaoT2K1Va9duLjQ1jmgnUuvVP82bPDrAL8',
            ],
            communities: [
              'ufl4PdK91Qf_1Efb61chYN6Sa6BZjU8mjPSqBbrDhDk',
              'sVYW_wqVAxaoT2K1Va9duLjQ1jmgnUuvVP82bPDrAL8',
            ],
            reported: [],
            block: 30173280,
            timestamp: 1740433835714,
            hash: 'YWQSrrjTPjw1ffcfvQVRbnmDzbFi2uQGgGqHqUHOY6I',
          },
          {
            name: 'SeedConnectedWithFriend',
            friend: '3xjh50DVq9n1n8xrxtbqO6UnWe-i_lMr5JdRdjcoC68',
            block: 30173280,
            timestamp: 1740433850297,
            hash: 'MUARS8aOLmDuaZMEmnC8-PQ6z-L_D1wmq19Tv2rCQqE',
          },
          {
            name: 'BrightID',
            block: 30173280,
            timestamp: 1740433857689,
            hash: 'g3hCxES49z5yFOFBtZEuN_ooWGIQjzPJMmtBraP47l8',
          },
          {
            name: 'SocialRecoverySetup',
            block: 30173280,
            timestamp: 1740433871133,
            hash: 'TcF8YfI-UT-vUrI42o0eFCNPTeF56xCOmHmKAxI9L44',
          },
          {
            name: 'Bitu',
            releaseTime: 1653882066611,
            linksNum: 21,
            confirmedScore: 21,
            directReports: {},
            indirectReports: {},
            reportedConnections: {},
            score: 2,
            block: 30173280,
            timestamp: 1740433875239,
            hash: '4faXJw229BtRzlnLY-6rROAwO1UL37bBrhavdgqtz6E',
          },
        ],
      },
      {
        id: 'qIgcVTJR543Oj1Efi1l0jfxfuISDPlALDS49ap8bf5s',
        level: 'already known',
        reportReason: null,
        timestamp: 1637397981000,
        verifications: [
          {
            name: 'SeedConnected',
            rank: 2,
            connected: [
              'ufl4PdK91Qf_1Efb61chYN6Sa6BZjU8mjPSqBbrDhDk',
              'sVYW_wqVAxaoT2K1Va9duLjQ1jmgnUuvVP82bPDrAL8',
            ],
            communities: [
              'ufl4PdK91Qf_1Efb61chYN6Sa6BZjU8mjPSqBbrDhDk',
              'sVYW_wqVAxaoT2K1Va9duLjQ1jmgnUuvVP82bPDrAL8',
              'Tf6Wtwlhjy3gydBvGsdPgVH0ttZXM-SOeFZIZePvZdg',
            ],
            reported: [],
            block: 30173280,
            timestamp: 1740433835690,
            hash: '1FPlUeEsGDgznwlBTNDJCgQLjp27aueCO0KzDirkDbY',
          },
          {
            name: 'SeedConnectedWithFriend',
            friend: 'r3EQTuwSzDg2PquYelbFBh5rF2Vh03d21M48laoeBOo',
            block: 30173280,
            timestamp: 1740433850322,
            hash: 'TiavFcPnL2C536JosO57uGMv33zG6KNaUXo4aeG9uw0',
          },
          {
            name: 'BrightID',
            block: 30173280,
            timestamp: 1740433857673,
            hash: 'HlxmXy4736rosQDNtonyX4A6hlYmFIvNCouPeljzcvo',
          },
          {
            name: 'SocialRecoverySetup',
            block: 30173280,
            timestamp: 1740433873606,
            hash: 'Bf-15xbcGZ0yPhDNQd1xj434QchVWDqqLd0TmXe2TX0',
          },
          {
            name: 'Bitu',
            releaseTime: 1653882066611,
            linksNum: 9,
            confirmedScore: 9,
            directReports: {},
            indirectReports: {},
            reportedConnections: {},
            score: 0,
            block: 30173280,
            timestamp: 1740433875239,
            hash: 'm1JvMm6j7mcUd37Gk3IXCRrvCNstze-UKGyQsGvZt1s',
          },
        ],
      },
      {
        id: 'pk8z5WrTsfJSsI-4mLeLuL4RHsN4s_CDokWYMMB_AnU',
        level: 'already known',
        reportReason: null,
        timestamp: 1637397986000,
        verifications: [
          {
            name: 'Aura',
            block: 30173280,
            timestamp: 1740433826802,
            domains: [
              {
                name: 'BrightID',
                categories: [
                  {
                    name: 'player',
                    score: 0,
                    level: 0,
                    impacts: [
                      {
                        evaluator:
                          '0wT96mjCAje7If7qjUyrzkVYBPoLPu3tfOzesdT3ShE',
                        level: null,
                        score: null,
                        confidence: 1,
                        impact: 0,
                      },
                    ],
                  },
                  {
                    name: 'subject',
                    score: 696586153.9102869,
                    level: 2,
                    impacts: [
                      {
                        evaluator:
                          'HxZfz3ipSp0rHsOhJQlievFqjV3DnU8BE6vhqNSecBM',
                        level: 1,
                        score: 100652472.08204281,
                        confidence: 4,
                        impact: 402609888.32817125,
                      },
                      {
                        evaluator:
                          '0wT96mjCAje7If7qjUyrzkVYBPoLPu3tfOzesdT3ShE',
                        level: 1,
                        score: 73494066.39552891,
                        confidence: 4,
                        impact: 293976265.58211565,
                      },
                    ],
                  },
                ],
              },
            ],
          },
          {
            name: 'SeedConnected',
            rank: 3,
            connected: [
              '-z6lbLFK4yxj1YmrUz7dYttceEg1XWZRoD_V8xE8qC0',
              'sVYW_wqVAxaoT2K1Va9duLjQ1jmgnUuvVP82bPDrAL8',
              'ufl4PdK91Qf_1Efb61chYN6Sa6BZjU8mjPSqBbrDhDk',
            ],
            communities: [
              '-z6lbLFK4yxj1YmrUz7dYttceEg1XWZRoD_V8xE8qC0',
              'sVYW_wqVAxaoT2K1Va9duLjQ1jmgnUuvVP82bPDrAL8',
              'ufl4PdK91Qf_1Efb61chYN6Sa6BZjU8mjPSqBbrDhDk',
            ],
            reported: [],
            block: 30173280,
            timestamp: 1740433832355,
            hash: 'mIw2w4lZrSHUAgaymdEbEz03-nh78SlZoKpoCsMv46c',
          },
          {
            name: 'SeedConnectedWithFriend',
            friend: 'aYb75g6vShlTfcJf5_FudGiC9H6QoywZDR2ZoTtDTZI',
            block: 30173280,
            timestamp: 1740433850370,
            hash: '2oS_jlWC_Romt7DsBBMiQsaiXtqMrbhSEjwLdK6dyt8',
          },
          {
            name: 'BrightID',
            block: 30173280,
            timestamp: 1740433854866,
            hash: '5bx2gHQcI8bFcaVyKpS1tpv8qZHD1-DRor5CszGLMv0',
          },
          {
            name: 'SocialRecoverySetup',
            block: 30173280,
            timestamp: 1740433873446,
            hash: 'NjSF9gkJed7VhjN5OpfEdnATNytWd6ajT-pLPl0Q6CU',
          },
          {
            name: 'Bitu',
            releaseTime: 1653882066611,
            linksNum: 13,
            confirmedScore: 13,
            directReports: {},
            indirectReports: {},
            reportedConnections: {},
            score: 0,
            block: 30173280,
            timestamp: 1740433875238,
            hash: 'bEIW8RUbtgn9BGqTFU5kl-TgY618PIXQyCZ-clE1XbQ',
          },
        ],
      },
      {
        id: 'hO7Mr-ZJv7bVcYAO8wSdI0l191LXSM4GsApajIXx-BE',
        level: 'already known',
        reportReason: null,
        timestamp: 1637398001000,
        verifications: [
          {
            name: 'Aura',
            block: 30173280,
            timestamp: 1740433826802,
            domains: [
              {
                name: 'BrightID',
                categories: [
                  {
                    name: 'player',
                    score: 0,
                    level: 0,
                    impacts: [
                      {
                        evaluator:
                          'HxZfz3ipSp0rHsOhJQlievFqjV3DnU8BE6vhqNSecBM',
                        level: null,
                        score: null,
                        confidence: 1,
                        impact: 0,
                      },
                    ],
                  },
                  {
                    name: 'subject',
                    score: 402609888.32817125,
                    level: 2,
                    impacts: [
                      {
                        evaluator:
                          'HxZfz3ipSp0rHsOhJQlievFqjV3DnU8BE6vhqNSecBM',
                        level: 1,
                        score: 100652472.08204281,
                        confidence: 4,
                        impact: 402609888.32817125,
                      },
                    ],
                  },
                ],
              },
            ],
          },
          {
            name: 'Seed',
            block: 30173280,
            timestamp: 1740433826885,
            hash: 'xMNvrF7iNk-Qw7Ak-zSK4ytGHtsOD1oGFvlQCoYa-ws',
          },
          {
            name: 'SeedConnected',
            rank: 3,
            connected: [
              'ETxf2qlnq4Kh',
              'sVYW_wqVAxaoT2K1Va9duLjQ1jmgnUuvVP82bPDrAL8',
              'ufl4PdK91Qf_1Efb61chYN6Sa6BZjU8mjPSqBbrDhDk',
            ],
            communities: [
              'ETxf2qlnq4Kh',
              'sVYW_wqVAxaoT2K1Va9duLjQ1jmgnUuvVP82bPDrAL8',
              'ufl4PdK91Qf_1Efb61chYN6Sa6BZjU8mjPSqBbrDhDk',
              '3vqWfpOxP2fR',
              'Pr5SHCQkGvSc',
              'Tf6Wtwlhjy3gydBvGsdPgVH0ttZXM-SOeFZIZePvZdg',
            ],
            reported: [],
            block: 30173280,
            timestamp: 1740433832679,
            hash: '4JvrxaowxeUqWf4JYiGAOs5xeBwuWL4YL0LTStMxdQo',
          },
          {
            name: 'SeedConnectedWithFriend',
            friend: null,
            block: 30173280,
            timestamp: 1740433850176,
            hash: 'X-wwCTaHCGzlE3XLbOI40L9V-bNzeXFqxyhkHbfI17M',
          },
          {
            name: 'BrightID',
            block: 30173280,
            timestamp: 1740433855063,
            hash: '8cUV05mwvz7_FE919BXg4cGlD0B13LgzzgLPElTpJgE',
          },
          {
            name: 'SocialRecoverySetup',
            block: 30173280,
            timestamp: 1740433872188,
            hash: 'm_LH1MrLAjwEIup5n02pxhn-4sV7fz-ljz6BB1NPGx8',
          },
          {
            name: 'Bitu',
            releaseTime: 1653882066611,
            linksNum: 14,
            confirmedScore: 14,
            directReports: {},
            indirectReports: {},
            reportedConnections: {},
            score: 0,
            block: 30173280,
            timestamp: 1740433875238,
            hash: 'g5gEPbDzBguHB91HPNO4-ZI1aXA-8fyIo1rLDI8sAiI',
          },
        ],
      },
      {
        id: '3RpwOMFR02p2ApFNq3V0gswtKhJCllUNJc5ewD7fgcE',
        level: 'already known',
        reportReason: null,
        timestamp: 1637398006000,
        verifications: [
          {
            name: 'Aura',
            block: 30173280,
            timestamp: 1740433826802,
            domains: [
              {
                name: 'BrightID',
                categories: [
                  {
                    name: 'trainer',
                    score: 2663788.5144666433,
                    level: 2,
                    impacts: [
                      {
                        evaluator:
                          'v5mibmGr9W08lhCI1exZr4PLt4VV7s-nVoJXOVlN2kg',
                        level: 2,
                        score: 665947.1286166608,
                        confidence: 4,
                        impact: 2663788.5144666433,
                      },
                    ],
                  },
                  {
                    name: 'player',
                    score: 91172337.3604701,
                    level: 3,
                    impacts: [
                      {
                        evaluator:
                          'HxZfz3ipSp0rHsOhJQlievFqjV3DnU8BE6vhqNSecBM',
                        level: null,
                        score: null,
                        confidence: 1,
                        impact: 0,
                      },
                      {
                        evaluator:
                          '1Ix6_UTI9FzFD9JVYeX7L-7P0cSt0uBEzoUBK_CL8QY',
                        level: 2,
                        score: 11702617.28153414,
                        confidence: 1,
                        impact: 11702617.28153414,
                      },
                      {
                        evaluator:
                          'zUTCJG6Kdwzas63OAWol8F8qmYY_RqaULE0ip-wQT_g',
                        level: null,
                        score: null,
                        confidence: 1,
                        impact: 0,
                      },
                      {
                        evaluator:
                          'ER-WJw5P6BUgmwdzg3IqlNtoU-NdftD3eukVaGW40j0',
                        level: null,
                        score: null,
                        confidence: 1,
                        impact: 0,
                      },
                      {
                        evaluator:
                          '1W25fVukTdb_a97fntgQZlzhmqDf7rg5Uom5vJ9vLHc',
                        level: null,
                        score: null,
                        confidence: 1,
                        impact: 0,
                      },
                      {
                        evaluator:
                          '0wT96mjCAje7If7qjUyrzkVYBPoLPu3tfOzesdT3ShE',
                        level: null,
                        score: null,
                        confidence: 1,
                        impact: 0,
                      },
                      {
                        evaluator:
                          'knDxkWi9Lx0I9DBCbSMmFvF0H7_HLsPsKm2PVwq2jJE',
                        level: null,
                        score: null,
                        confidence: 1,
                        impact: 0,
                      },
                      {
                        evaluator:
                          'vb29zMJAY3jNeWv32FtUuMokSQv4We2ueTldSqkJV-A',
                        level: null,
                        score: null,
                        confidence: 1,
                        impact: 0,
                      },
                      {
                        evaluator:
                          'DldPc3D0SFcM4Mrgml5E6kE3XLNNmoe0R3RKiBX4Sqc',
                        level: null,
                        score: null,
                        confidence: 1,
                        impact: 0,
                      },
                      {
                        evaluator:
                          'pQU_kWrL6E7M3J9FIg4LLd0tBSwcPy7p8ziUe9cdrfo',
                        level: null,
                        score: null,
                        confidence: 1,
                        impact: 0,
                      },
                      {
                        evaluator:
                          '3Oz-Gq2kEA_GSg6--vHNAbgZnbQ8Ryf9xPIFksn8XXU',
                        level: null,
                        score: null,
                        confidence: 1,
                        impact: 0,
                      },
                      {
                        evaluator:
                          'acOnlyxc3FxJB2ztNi1gtvg5Qmmj7NNK9N_Ax7B6UxI',
                        level: null,
                        score: null,
                        confidence: 1,
                        impact: 0,
                      },
                      {
                        evaluator:
                          'xqmMHQMnBdakxs3sXXjy7qVqPoXmhhwOt4c_z1tSPwM',
                        level: 2,
                        score: 21097856.903279718,
                        confidence: 3,
                        impact: 63293570.70983915,
                      },
                      {
                        evaluator:
                          'v5mibmGr9W08lhCI1exZr4PLt4VV7s-nVoJXOVlN2kg',
                        level: 2,
                        score: 16176149.369096812,
                        confidence: 1,
                        impact: 16176149.369096812,
                      },
                    ],
                  },
                  {
                    name: 'subject',
                    score: 7404055060.272889,
                    level: 4,
                    impacts: [
                      {
                        evaluator:
                          'w4icPkJl0AO7sCCrz5Uf5I-3Fft1uX7I-3TJPbhWH5A',
                        level: null,
                        score: null,
                        confidence: 4,
                        impact: 0,
                      },
                      {
                        evaluator:
                          'AWtJ0wj7j1sFkZStsh6n3UvXsX3pGj9Oqgw2xMF9B_Y',
                        level: 3,
                        score: 152720819.208647,
                        confidence: 4,
                        impact: 610883276.834588,
                      },
                      {
                        evaluator:
                          's56WKMXMz5TdXdCYVO1XKekrWo-jYhODN6GFH9QdhwE',
                        level: 3,
                        score: 134867285.85970923,
                        confidence: 4,
                        impact: 539469143.4388369,
                      },
                      {
                        evaluator:
                          '09w4r-qB7nfooRBN0_FmM9r5SwWfwpIn-x1rNTfE6IA',
                        level: 3,
                        score: 203002315.72423297,
                        confidence: 4,
                        impact: 812009262.8969319,
                      },
                      {
                        evaluator:
                          'AsjAK5gJ68SMYvGfCAuROsMrJQ0_83ZS92xy94LlfIA',
                        level: 3,
                        score: 302332518.53370947,
                        confidence: 2,
                        impact: 604665037.0674189,
                      },
                      {
                        evaluator:
                          '6l5aNRVsqduR2OcRQ7T3tQymJlTya_v7qE4qc-oQHOk',
                        level: 0,
                        score: 0,
                        confidence: 2,
                        impact: 0,
                      },
                      {
                        evaluator:
                          'VTKYkVm2ZQ82xMdhkHOBOcLdoMCdTEizr0mk3jGrueA',
                        level: 0,
                        score: 0,
                        confidence: 4,
                        impact: 0,
                      },
                      {
                        evaluator:
                          'kYolzqnjGjQNP2o8Zerc9X1jehU55C3sj898VCz2nYU',
                        level: 0,
                        score: 0,
                        confidence: 4,
                        impact: 0,
                      },
                      {
                        evaluator:
                          '7ZCFFJ9B4aIairvwGfx1URG0o5okFf2y-xrTXV1pcy0',
                        level: 0,
                        score: 0,
                        confidence: 4,
                        impact: 0,
                      },
                      {
                        evaluator:
                          'JR_Z7RIfg0sB8N1sJK22IOQbTJGrmMwn6O2vSMdZtGA',
                        level: 0,
                        score: 0,
                        confidence: 4,
                        impact: 0,
                      },
                      {
                        evaluator:
                          'ZAXr3ePl4MrS_H8pX8GGnTImxH28fnJQjQ16qJjeYZI',
                        level: 0,
                        score: 0,
                        confidence: 4,
                        impact: 0,
                      },
                      {
                        evaluator:
                          'LlDvhjw-xX3suCn3hvrJED3s3bKRJSPv9vreiRwD8VQ',
                        level: 0,
                        score: 0,
                        confidence: 1,
                        impact: 0,
                      },
                      {
                        evaluator:
                          'UxYHGX4JtnUrYTZzVqbTLu9Azw5hAfDK1X7DLXp7_tQ',
                        level: 3,
                        score: 244479365.61455446,
                        confidence: 3,
                        impact: 733438096.8436635,
                      },
                      {
                        evaluator:
                          'ojHLZ3Fm5HMpq3-_pA7L5Gl5TCqlLne3rAJn_OPqec0',
                        level: null,
                        score: null,
                        confidence: 4,
                        impact: 0,
                      },
                      {
                        evaluator:
                          '0t8cHnpldUAuEnvE_nU7HEB8Xn_094_-9N3AfKVX4Sc',
                        level: null,
                        score: null,
                        confidence: 4,
                        impact: 0,
                      },
                      {
                        evaluator:
                          'HxZfz3ipSp0rHsOhJQlievFqjV3DnU8BE6vhqNSecBM',
                        level: 1,
                        score: 100652472.08204281,
                        confidence: 4,
                        impact: 402609888.32817125,
                      },
                      {
                        evaluator:
                          '1Ix6_UTI9FzFD9JVYeX7L-7P0cSt0uBEzoUBK_CL8QY',
                        level: 3,
                        score: 130206694.59939781,
                        confidence: 2,
                        impact: 260413389.19879562,
                      },
                      {
                        evaluator:
                          'zUTCJG6Kdwzas63OAWol8F8qmYY_RqaULE0ip-wQT_g',
                        level: 1,
                        score: 32800474.184813857,
                        confidence: 1,
                        impact: 32800474.184813857,
                      },
                      {
                        evaluator:
                          'ER-WJw5P6BUgmwdzg3IqlNtoU-NdftD3eukVaGW40j0',
                        level: 1,
                        score: 42662101.649825975,
                        confidence: 4,
                        impact: 170648406.5993039,
                      },
                      {
                        evaluator:
                          '1W25fVukTdb_a97fntgQZlzhmqDf7rg5Uom5vJ9vLHc',
                        level: 0,
                        score: 0,
                        confidence: 4,
                        impact: 0,
                      },
                      {
                        evaluator:
                          '0wT96mjCAje7If7qjUyrzkVYBPoLPu3tfOzesdT3ShE',
                        level: 1,
                        score: 73494066.39552891,
                        confidence: 4,
                        impact: 293976265.58211565,
                      },
                      {
                        evaluator:
                          'knDxkWi9Lx0I9DBCbSMmFvF0H7_HLsPsKm2PVwq2jJE',
                        level: 0,
                        score: 0,
                        confidence: 4,
                        impact: 0,
                      },
                      {
                        evaluator:
                          'vb29zMJAY3jNeWv32FtUuMokSQv4We2ueTldSqkJV-A',
                        level: 0,
                        score: 0,
                        confidence: 4,
                        impact: 0,
                      },
                      {
                        evaluator:
                          'DldPc3D0SFcM4Mrgml5E6kE3XLNNmoe0R3RKiBX4Sqc',
                        level: null,
                        score: null,
                        confidence: 4,
                        impact: 0,
                      },
                      {
                        evaluator:
                          'pQU_kWrL6E7M3J9FIg4LLd0tBSwcPy7p8ziUe9cdrfo',
                        level: 1,
                        score: 97610002.27358976,
                        confidence: 3,
                        impact: 292830006.8207693,
                      },
                      {
                        evaluator:
                          'acOnlyxc3FxJB2ztNi1gtvg5Qmmj7NNK9N_Ax7B6UxI',
                        level: null,
                        score: null,
                        confidence: 1,
                        impact: 0,
                      },
                      {
                        evaluator:
                          'xqmMHQMnBdakxs3sXXjy7qVqPoXmhhwOt4c_z1tSPwM',
                        level: 3,
                        score: 283726707.50423574,
                        confidence: 3,
                        impact: 851180122.5127072,
                      },
                      {
                        evaluator:
                          'v5mibmGr9W08lhCI1exZr4PLt4VV7s-nVoJXOVlN2kg',
                        level: 3,
                        score: 301995876.24125063,
                        confidence: 4,
                        impact: 1207983504.9650025,
                      },
                      {
                        evaluator:
                          'OeNllgD2Q2K845Z_ANwah_9yTbJ5PFpvyY8zITkOuFs',
                        level: 3,
                        score: 197049394.99992335,
                        confidence: 3,
                        impact: 591148184.99977,
                      },
                    ],
                  },
                ],
              },
            ],
          },
          {
            name: 'Seed',
            block: 30173280,
            timestamp: 1740433826885,
            hash: 'uMVLbs1BRt3lx0BlpazD3gWE3-88qjQwtL2kp34HsnA',
          },
          {
            name: 'SeedConnected',
            rank: 13,
            connected: [
              'ETxf2qlnq4Kh',
              'weKyDO9uEPz-KzO13IupiCzT40fgKhETD2kKuX3ZoqA',
              'GYGbx74q6-pYRG4UHNfrMVyZ6ZIZQYUCSHhlBGkvBjE',
              'ufl4PdK91Qf_1Efb61chYN6Sa6BZjU8mjPSqBbrDhDk',
              '---U49atc2d-z0HFP_0-qeml3rsj_I7Nsd7QA5aP7mc',
              'aM4xs1M1MB42ApdYrEQyOBQX2hzdsSGHZ1oiXPq6K5A',
              'PbtXC7NF5bhiyrDoCShlg3iKK3d9bto_uxg9B4BGv9E',
              'hWIVtbx4VcSVAY1_r1bIH66QvS9RNFXJWGKTy_c5qxY',
              'bSGdH_RTE9CbHvBpx3Y08OUE0cw7fexp7y0M-9pD4S0',
              'jutFlbXP0eJnJ2sPT8aibSYdYVde9XQZ_i-z96N9r1w',
              'vPmP-pkagrl02LrGgIaFf4aimR4rTrbnIcYT5t7q2w4',
              'n82bowHhUeDG9Z6N36tPktN3A4Pq3Yn7_7On9wGHBss',
              'FB6cAjUL7OqXyG-IbYwQFnzTvOGs0xBoWdyE1SWmmZ0',
            ],
            communities: [
              'ETxf2qlnq4Kh',
              'weKyDO9uEPz-KzO13IupiCzT40fgKhETD2kKuX3ZoqA',
              'GYGbx74q6-pYRG4UHNfrMVyZ6ZIZQYUCSHhlBGkvBjE',
              'ufl4PdK91Qf_1Efb61chYN6Sa6BZjU8mjPSqBbrDhDk',
              '---U49atc2d-z0HFP_0-qeml3rsj_I7Nsd7QA5aP7mc',
              'aM4xs1M1MB42ApdYrEQyOBQX2hzdsSGHZ1oiXPq6K5A',
              'PbtXC7NF5bhiyrDoCShlg3iKK3d9bto_uxg9B4BGv9E',
              'hWIVtbx4VcSVAY1_r1bIH66QvS9RNFXJWGKTy_c5qxY',
              'bSGdH_RTE9CbHvBpx3Y08OUE0cw7fexp7y0M-9pD4S0',
              'jutFlbXP0eJnJ2sPT8aibSYdYVde9XQZ_i-z96N9r1w',
              'vPmP-pkagrl02LrGgIaFf4aimR4rTrbnIcYT5t7q2w4',
              'n82bowHhUeDG9Z6N36tPktN3A4Pq3Yn7_7On9wGHBss',
              'FB6cAjUL7OqXyG-IbYwQFnzTvOGs0xBoWdyE1SWmmZ0',
              '3vqWfpOxP2fR',
              'Pr5SHCQkGvSc',
            ],
            reported: [],
            block: 30173280,
            timestamp: 1740433832679,
            hash: 'HfajQi_rU3Z-yJF6_QF5ZWwR9WSg9qTDACOKrze8y_I',
          },
          {
            name: 'SeedConnectedWithFriend',
            friend: null,
            block: 30173280,
            timestamp: 1740433850176,
            hash: 'geixJy-_NEmLX3klYz6LDbaOLCTuqtbL-72A7ltfRjE',
          },
          {
            name: 'BrightID',
            block: 30173280,
            timestamp: 1740433855062,
            hash: '6MJfs7R22J9e5iaM8rdsC4ErDyHM2lW2XQKvI011uj8',
          },
          {
            name: 'SocialRecoverySetup',
            block: 30173280,
            timestamp: 1740433870603,
            hash: 'n0Gq9NDWCVnNlKC73aRt5SCjWbb6GuI0c8WoMrLj5Jw',
          },
          {
            name: 'Bitu',
            releaseTime: 1653882066611,
            linksNum: 35,
            confirmedScore: 35,
            directReports: {},
            indirectReports: {},
            reportedConnections: {},
            score: 14,
            block: 30173280,
            timestamp: 1740433875234,
            hash: 'f-ZKDhygZ8NjljZSDGdf8lV9vyEaTpgpevd8XYLrb1g',
          },
        ],
      },
      {
        id: 'IZsoCazt7badQLtVo32Pq7YnUaGAesQHiLKcU0wVk1k',
        level: 'already known',
        reportReason: null,
        timestamp: 1637398186000,
        verifications: [
          {
            name: 'Seed',
            block: 30173280,
            timestamp: 1740433826885,
            hash: 'uGZmyTPD4vdeLR_8PInQaeV3oBkDCQSlRL4NDLkbATU',
          },
          {
            name: 'SeedConnected',
            rank: 1,
            connected: ['w4dNg2yUSuuMN_SfPBmqTbdNhk_nsFgwoO36ZUcDt88'],
            communities: ['w4dNg2yUSuuMN_SfPBmqTbdNhk_nsFgwoO36ZUcDt88'],
            reported: [],
            block: 30173280,
            timestamp: 1740433832840,
            hash: 'dcYoqU-A3VOQtdK0Bz5ZSPDmKmO6--xR8DVNi2luNJw',
          },
          {
            name: 'SeedConnectedWithFriend',
            friend: null,
            block: 30173280,
            timestamp: 1740433850176,
            hash: '63raEVtpPwkrIWUFJTfA0q_NajZTth1vkbyObpS9PME',
          },
          {
            name: 'BrightID',
            block: 30173280,
            timestamp: 1740433855223,
            hash: 'aFPRRHF9XE7RqPWcEPWzICHJzvMqsLl6A-VdZIfhITw',
          },
          {
            name: 'SocialRecoverySetup',
            block: 30173280,
            timestamp: 1740433872394,
            hash: 'chPGZhs_A-X4xEZZOVD9p-z2Vmwy1sEdeVObUTqlFMI',
          },
          {
            name: 'Bitu',
            releaseTime: 1653882066611,
            linksNum: 8,
            confirmedScore: 8,
            directReports: {},
            indirectReports: {},
            reportedConnections: {},
            score: 8,
            block: 30173280,
            timestamp: 1740433875232,
            hash: 'ZF4K3fB9EacFYBNxGNctv1paQIarITGS3j5akfTS5xI',
          },
        ],
      },
      {
        id: 'LXbJsTuOeR0d4PRUb0lsjAX0sVteJcS0hRQQ2ykdlIE',
        level: 'already known',
        reportReason: null,
        timestamp: 1637398226000,
        verifications: [
          {
            name: 'Aura',
            block: 30173280,
            timestamp: 1740433826802,
            domains: [
              {
                name: 'BrightID',
                categories: [
                  {
                    name: 'player',
                    score: 0,
                    level: 0,
                    impacts: [
                      {
                        evaluator:
                          '0wT96mjCAje7If7qjUyrzkVYBPoLPu3tfOzesdT3ShE',
                        level: null,
                        score: null,
                        confidence: 1,
                        impact: 0,
                      },
                    ],
                  },
                  {
                    name: 'subject',
                    score: 696586153.9102869,
                    level: 2,
                    impacts: [
                      {
                        evaluator:
                          'HxZfz3ipSp0rHsOhJQlievFqjV3DnU8BE6vhqNSecBM',
                        level: 1,
                        score: 100652472.08204281,
                        confidence: 4,
                        impact: 402609888.32817125,
                      },
                      {
                        evaluator:
                          '0wT96mjCAje7If7qjUyrzkVYBPoLPu3tfOzesdT3ShE',
                        level: 1,
                        score: 73494066.39552891,
                        confidence: 4,
                        impact: 293976265.58211565,
                      },
                    ],
                  },
                ],
              },
            ],
          },
          {
            name: 'SeedConnected',
            rank: 1,
            connected: ['3vqWfpOxP2fR'],
            communities: [
              '3vqWfpOxP2fR',
              'Tf6Wtwlhjy3gydBvGsdPgVH0ttZXM-SOeFZIZePvZdg',
            ],
            reported: [],
            block: 30173280,
            timestamp: 1740433831823,
            hash: 'lCNAM54LE8WeLZogPXzqiMGtnj8Eml-Z2aNq7ONqzos',
          },
          {
            name: 'SeedConnectedWithFriend',
            friend: 'aYb75g6vShlTfcJf5_FudGiC9H6QoywZDR2ZoTtDTZI',
            block: 30173280,
            timestamp: 1740433850322,
            hash: 'mP3rkud3iaajNYezu9VZ0imdnCNi0iCEtC2A6tFxtRk',
          },
          {
            name: 'BrightID',
            block: 30173280,
            timestamp: 1740433854324,
            hash: '5CubuObYiolY_7cad4r9ouEyL01tHU24V6BjIVcqR9E',
          },
          {
            name: 'SocialRecoverySetup',
            block: 30173280,
            timestamp: 1740433872912,
            hash: 's60orRiS_LXCY4-xAmpVDBv3oDjTgWK9vzAHvwJzMnI',
          },
          {
            name: 'Bitu',
            releaseTime: 1653882066611,
            linksNum: 15,
            confirmedScore: 15,
            directReports: {},
            indirectReports: {},
            reportedConnections: {},
            score: 5,
            block: 30173280,
            timestamp: 1740433875239,
            hash: 'TqcG5LmpIgkmP5sUkFjEF-BYqTXb2Z2hkbzBZTXxx7E',
          },
        ],
      },
      {
        id: 'GWvoQ7BXbGrGqfuaUsRQyo3Q_As-bf5n6smIcFYdLPY',
        level: 'already known',
        reportReason: null,
        timestamp: 1637398236000,
        verifications: [
          {
            name: 'Aura',
            block: 30173280,
            timestamp: 1740433826802,
            domains: [
              {
                name: 'BrightID',
                categories: [
                  {
                    name: 'player',
                    score: 0,
                    level: 0,
                    impacts: [
                      {
                        evaluator:
                          '0wT96mjCAje7If7qjUyrzkVYBPoLPu3tfOzesdT3ShE',
                        level: null,
                        score: null,
                        confidence: 1,
                        impact: 0,
                      },
                    ],
                  },
                  {
                    name: 'subject',
                    score: 696586153.9102869,
                    level: 2,
                    impacts: [
                      {
                        evaluator:
                          'HxZfz3ipSp0rHsOhJQlievFqjV3DnU8BE6vhqNSecBM',
                        level: 1,
                        score: 100652472.08204281,
                        confidence: 4,
                        impact: 402609888.32817125,
                      },
                      {
                        evaluator:
                          '0wT96mjCAje7If7qjUyrzkVYBPoLPu3tfOzesdT3ShE',
                        level: 1,
                        score: 73494066.39552891,
                        confidence: 4,
                        impact: 293976265.58211565,
                      },
                    ],
                  },
                ],
              },
            ],
          },
          {
            name: 'Seed',
            block: 30173280,
            timestamp: 1740433826884,
            hash: 'QkPXlMC7RLaRPtvsUhK2TroTku_-B4-OpaduUttjjXc',
          },
          {
            name: 'SeedConnected',
            rank: 1,
            connected: ['Pr5SHCQkGvSc'],
            communities: ['Pr5SHCQkGvSc'],
            reported: [],
            block: 30173280,
            timestamp: 1740433832834,
            hash: '3B1bT9HZHjA68LtxKK4Jqe7czf-kNv-xr1o-HruA3CM',
          },
          {
            name: 'SeedConnectedWithFriend',
            friend: null,
            block: 30173280,
            timestamp: 1740433850176,
            hash: '5KlTALpXzAHE9HfGKgEvAidYctomxA5bkPwEZD5_BhU',
          },
          {
            name: 'BrightID',
            block: 30173280,
            timestamp: 1740433855220,
            hash: '8Zf9uhair3bqpoeE1kzFCCY5DfrfnTu2Ce4XJ-buaZA',
          },
          {
            name: 'SocialRecoverySetup',
            block: 30173280,
            timestamp: 1740433872021,
            hash: 'eblPfVw_psH2ChAjTy9c-jNz6qy1koQz6RlQSt-OIVE',
          },
          {
            name: 'Bitu',
            releaseTime: 1653882066611,
            linksNum: 31,
            confirmedScore: 25,
            directReports: {},
            indirectReports: {
              zDi6kJaO3JKkv8e72Q9u7rdecPYkzfb6a2lOxJaDZHE: -1,
              j07qLQF84CppaMqy4hzHm8CU4JJ2dLuRzkSXkob51uE: -1,
              ShWqKn_CoxuNl3slAJ_krl8vEI7qqJ8sSNBfN8X9h5Q: -1,
              TUnr9EjYPpUITRR3k5my7aGWghdv_Hdi3jVv15P1N3k: -2,
              '4-h1hI8Kde406y5x3x-m4Teu5NqMLxaiuXoDzjU-tDg': -1,
            },
            reportedConnections: {
              zDi6kJaO3JKkv8e72Q9u7rdecPYkzfb6a2lOxJaDZHE: [
                'frLHtQ0nk-vgd99BAK9y-PLnN0UsO3FPrNs-Db-i9K8',
              ],
              j07qLQF84CppaMqy4hzHm8CU4JJ2dLuRzkSXkob51uE: [
                'frLHtQ0nk-vgd99BAK9y-PLnN0UsO3FPrNs-Db-i9K8',
              ],
              ShWqKn_CoxuNl3slAJ_krl8vEI7qqJ8sSNBfN8X9h5Q: [
                'frLHtQ0nk-vgd99BAK9y-PLnN0UsO3FPrNs-Db-i9K8',
              ],
              TUnr9EjYPpUITRR3k5my7aGWghdv_Hdi3jVv15P1N3k: [
                'x8D-HX9bljRsxu0mWkVzMOJlyHmffQvnPrG9I-HTJbQ',
                'frLHtQ0nk-vgd99BAK9y-PLnN0UsO3FPrNs-Db-i9K8',
              ],
              '4-h1hI8Kde406y5x3x-m4Teu5NqMLxaiuXoDzjU-tDg': [
                '0wT96mjCAje7If7qjUyrzkVYBPoLPu3tfOzesdT3ShE',
              ],
            },
            score: 0,
            block: 30173280,
            timestamp: 1740433875239,
            hash: 't_0UqCrrwFFYOSh4nXcK1Gb1wORPVXDcnyq2leEHlKc',
          },
        ],
      },
      {
        id: 'ZXJ2x7DwHKccv4GhFnKAd5hMFyLLn_SkFKhB91e0ecs',
        level: 'already known',
        reportReason: null,
        timestamp: 1637398246000,
        verifications: [
          {
            name: 'SeedConnected',
            rank: 1,
            connected: ['Pr5SHCQkGvSc'],
            communities: ['Pr5SHCQkGvSc'],
            reported: [],
            block: 30173280,
            timestamp: 1740433832835,
            hash: 'z6tp5VG_i2lvOo6-vGN6eEn5JrLFnmywia6JgB35YmI',
          },
          {
            name: 'BrightID',
            block: 30173280,
            timestamp: 1740433855220,
            hash: '2uDd12PMJhP50DR_3kZpT6G7SilUqq3C_Xekv4SL2PY',
          },
          {
            name: 'Bitu',
            releaseTime: 1653882066611,
            linksNum: 8,
            confirmedScore: 7,
            directReports: {},
            indirectReports: {
              zDi6kJaO3JKkv8e72Q9u7rdecPYkzfb6a2lOxJaDZHE: -1,
            },
            reportedConnections: {
              zDi6kJaO3JKkv8e72Q9u7rdecPYkzfb6a2lOxJaDZHE: [
                'frLHtQ0nk-vgd99BAK9y-PLnN0UsO3FPrNs-Db-i9K8',
              ],
            },
            score: 0,
            block: 30173280,
            timestamp: 1740433875243,
            hash: 'vpb1OZzbabSkhani8KxJOp_fxlBbySAle4-tmRFML5g',
          },
        ],
      },
      {
        id: '3AjOGyl30RsBMUVgLU0EMFowc22lkVnoCpv8Nf8BCF4',
        level: 'already known',
        reportReason: null,
        timestamp: 1637398251000,
        verifications: [
          {
            name: 'SeedConnected',
            rank: -5,
            connected: ['3vqWfpOxP2fR'],
            communities: ['3vqWfpOxP2fR'],
            reported: [
              'Pr5SHCQkGvSc',
              'Tf6Wtwlhjy3gydBvGsdPgVH0ttZXM-SOeFZIZePvZdg',
            ],
            block: 30173280,
            timestamp: 1740433832677,
            hash: '6zgaoXnsemfkxSsy5O-f38a1rRbGJkzoMxAwIIXru6o',
          },
          {
            name: 'Bitu',
            releaseTime: 1653882066611,
            linksNum: 10,
            confirmedScore: 10,
            directReports: {},
            indirectReports: {},
            reportedConnections: {},
            score: 0,
            block: 30173280,
            timestamp: 1740433875239,
            hash: 'EcmD1yIrMbXBc_2cYF3jAG0ulk_WyLHoG6KKSqibmso',
          },
        ],
      },
      {
        id: 'XlrI8CPcWZIMNNIXNe9gPA_0n8CEV_E4GUUiGWAlCoI',
        level: 'already known',
        reportReason: null,
        timestamp: 1637398261000,
        verifications: [
          {
            name: 'SeedConnected',
            rank: 1,
            connected: ['Tf6Wtwlhjy3gydBvGsdPgVH0ttZXM-SOeFZIZePvZdg'],
            communities: ['Tf6Wtwlhjy3gydBvGsdPgVH0ttZXM-SOeFZIZePvZdg'],
            reported: [],
            block: 30173280,
            timestamp: 1740433832007,
            hash: 'C0eVNWfSNG33DfA8xTed-CAW30KgirawchryTi1Wjeg',
          },
          {
            name: 'SeedConnectedWithFriend',
            friend: 'wWQCn_pBjBQUDKa6POkUvyYkQye4CIhBExDSicKjcPw',
            block: 30173280,
            timestamp: 1740433850177,
            hash: 'CzFdutbVIIsUOfSf630d9hnpAaFFuJCwdtZgQBBcB3I',
          },
          {
            name: 'BrightID',
            block: 30173280,
            timestamp: 1740433854495,
            hash: 'dGbyCX5hO71pC5K9UEy3nkbnU_CBf7rWhwva0NyxWWw',
          },
        ],
      },
      {
        id: 'P5-zk0b7pjQ5CJhjSViVWjXz6kj_gGyJ1JevuNr2t4U',
        level: 'already known',
        reportReason: null,
        timestamp: 1637398391000,
        verifications: [
          {
            name: 'Aura',
            block: 30173280,
            timestamp: 1740433826802,
            domains: [
              {
                name: 'BrightID',
                categories: [
                  {
                    name: 'subject',
                    score: 301957416.24612844,
                    level: 2,
                    impacts: [
                      {
                        evaluator:
                          'HxZfz3ipSp0rHsOhJQlievFqjV3DnU8BE6vhqNSecBM',
                        level: 1,
                        score: 100652472.08204281,
                        confidence: 3,
                        impact: 301957416.24612844,
                      },
                    ],
                  },
                ],
              },
            ],
          },
          {
            name: 'SeedConnected',
            rank: 3,
            connected: [
              'ufl4PdK91Qf_1Efb61chYN6Sa6BZjU8mjPSqBbrDhDk',
              'sVYW_wqVAxaoT2K1Va9duLjQ1jmgnUuvVP82bPDrAL8',
              'hWIVtbx4VcSVAY1_r1bIH66QvS9RNFXJWGKTy_c5qxY',
            ],
            communities: [
              'ufl4PdK91Qf_1Efb61chYN6Sa6BZjU8mjPSqBbrDhDk',
              'sVYW_wqVAxaoT2K1Va9duLjQ1jmgnUuvVP82bPDrAL8',
              'hWIVtbx4VcSVAY1_r1bIH66QvS9RNFXJWGKTy_c5qxY',
              'Tf6Wtwlhjy3gydBvGsdPgVH0ttZXM-SOeFZIZePvZdg',
              'Pr5SHCQkGvSc',
            ],
            reported: [],
            block: 30173280,
            timestamp: 1740433831650,
            hash: 'YVJhIEcqQ3RZyX-_n-oVPE-roWsSMOzb5k1T0XNB6q0',
          },
          {
            name: 'SeedConnectedWithFriend',
            friend: 'E9JjHwYU8UhImzDImUHvJ3mWAyOTPN5WmFd99QY7aGQ',
            block: 30173280,
            timestamp: 1740433850370,
            hash: 'fMHvHwZLqHd-ugzXaAUAn-qnT0oeTDC1v2YQAH4cnZI',
          },
          {
            name: 'BrightID',
            block: 30173280,
            timestamp: 1740433854152,
            hash: 'tOD9U4DyfJQK_nYzOZspg_Pgs1brkuSUNBTJt8H8xhQ',
          },
          {
            name: 'SocialRecoverySetup',
            block: 30173280,
            timestamp: 1740433873281,
            hash: 'IPbAUuSygbYyjSZ-xJ9nB3MSxWMpjnHWZfHJP2_z4m0',
          },
          {
            name: 'Bitu',
            releaseTime: 1653882066611,
            linksNum: 8,
            confirmedScore: 8,
            directReports: {},
            indirectReports: {},
            reportedConnections: {},
            score: 4,
            block: 30173280,
            timestamp: 1740433875238,
            hash: 'r9nSL4QlClmIw1JUpXuviFGASS7PJS7i5TsHHWSuf5U',
          },
        ],
      },
      {
        id: 'rGhW8pA0YnrkNIxFzTwdKyoSDxmof2FtBsPnS8DEW0g',
        level: 'already known',
        reportReason: null,
        timestamp: 1637398396000,
        verifications: [
          {
            name: 'Aura',
            block: 30173280,
            timestamp: 1740433826802,
            domains: [
              {
                name: 'BrightID',
                categories: [
                  {
                    name: 'subject',
                    score: 402609888.32817125,
                    level: 2,
                    impacts: [
                      {
                        evaluator:
                          'HxZfz3ipSp0rHsOhJQlievFqjV3DnU8BE6vhqNSecBM',
                        level: 1,
                        score: 100652472.08204281,
                        confidence: 4,
                        impact: 402609888.32817125,
                      },
                    ],
                  },
                ],
              },
            ],
          },
          {
            name: 'SeedConnected',
            rank: 2,
            connected: [
              'sVYW_wqVAxaoT2K1Va9duLjQ1jmgnUuvVP82bPDrAL8',
              'ufl4PdK91Qf_1Efb61chYN6Sa6BZjU8mjPSqBbrDhDk',
            ],
            communities: [
              'sVYW_wqVAxaoT2K1Va9duLjQ1jmgnUuvVP82bPDrAL8',
              'ufl4PdK91Qf_1Efb61chYN6Sa6BZjU8mjPSqBbrDhDk',
            ],
            reported: [],
            block: 30173280,
            timestamp: 1740433838146,
            hash: '1ZCRw6Hxfelh1g0PdHrXsXwAHDfRNBUtBgg-7ZrQojo',
          },
          {
            name: 'SeedConnectedWithFriend',
            friend: 'LXbJsTuOeR0d4PRUb0lsjAX0sVteJcS0hRQQ2ykdlIE',
            block: 30173280,
            timestamp: 1740433850357,
            hash: 'bx0HJebf1MVDbOkMYXPKZO1xqEL1OUIxPG-aIzrhMWY',
          },
          {
            name: 'BrightID',
            block: 30173280,
            timestamp: 1740433859631,
            hash: '6NAzEPujD25YmR_PB7wXoPAnl-uBtAV8pPAU7uutwgE',
          },
          {
            name: 'SocialRecoverySetup',
            block: 30173280,
            timestamp: 1740433873621,
            hash: 'W8GBcIW9PpbPOS6U3Qc2FCu2dvgzunowmQmqvKyXuVI',
          },
          {
            name: 'Bitu',
            releaseTime: 1653882066611,
            linksNum: 5,
            confirmedScore: 5,
            directReports: {},
            indirectReports: {},
            reportedConnections: {},
            score: 0,
            block: 30173280,
            timestamp: 1740433875246,
            hash: 'n0EjnI176LD6rBLb9kdF6DapGlG9tl6HmJBdppasEn8',
          },
        ],
      },
      {
        id: '_3jvLgWzFmJIrvh3pCh9XsfDdgx-z-Sz7IsTcl83tTU',
        level: 'already known',
        reportReason: null,
        timestamp: 1637398411000,
        verifications: [
          {
            name: 'Aura',
            block: 30173280,
            timestamp: 1740433826802,
            domains: [
              {
                name: 'BrightID',
                categories: [
                  {
                    name: 'subject',
                    score: 402609888.32817125,
                    level: 2,
                    impacts: [
                      {
                        evaluator:
                          'HxZfz3ipSp0rHsOhJQlievFqjV3DnU8BE6vhqNSecBM',
                        level: 1,
                        score: 100652472.08204281,
                        confidence: 4,
                        impact: 402609888.32817125,
                      },
                    ],
                  },
                ],
              },
            ],
          },
          {
            name: 'SeedConnected',
            rank: 2,
            connected: [
              'sVYW_wqVAxaoT2K1Va9duLjQ1jmgnUuvVP82bPDrAL8',
              'ufl4PdK91Qf_1Efb61chYN6Sa6BZjU8mjPSqBbrDhDk',
            ],
            communities: [
              'sVYW_wqVAxaoT2K1Va9duLjQ1jmgnUuvVP82bPDrAL8',
              'ufl4PdK91Qf_1Efb61chYN6Sa6BZjU8mjPSqBbrDhDk',
            ],
            reported: [],
            block: 30173280,
            timestamp: 1740433838761,
            hash: 'S978JqQsT85swhFAeD00p4kr57Pm5BmwpboxTvzEMP0',
          },
          {
            name: 'SeedConnectedWithFriend',
            friend: 'fA74PHRZFP_4r4Cu_3CqN2p614noBtmaFPqCeopU9Ng',
            block: 30173280,
            timestamp: 1740433850370,
            hash: 'v3-YGIQOLqPJ_9sDNLzAFr8lm7_pO6vggmUkxl_64RA',
          },
          {
            name: 'BrightID',
            block: 30173280,
            timestamp: 1740433860149,
            hash: 'NSOi5MmJopwpTPwWP5ZnVcqSmY8jV9hhBc1l1Gtrkcw',
          },
          {
            name: 'SocialRecoverySetup',
            block: 30173280,
            timestamp: 1740433870243,
            hash: 'xeRHX2vJiKj1VrktnQ6IiIsomH9hrXM7qHMBapBgtME',
          },
          {
            name: 'Bitu',
            releaseTime: 1653882066611,
            linksNum: 6,
            confirmedScore: 6,
            directReports: {},
            indirectReports: {},
            reportedConnections: {},
            score: 0,
            block: 30173280,
            timestamp: 1740433875239,
            hash: 'dNQ5RzNYdUsMocoDLhbxM0IT1P_ChYqniOPjY1HfeR4',
          },
        ],
      },
      {
        id: '1N0kTWAnhL9rmJAl8coyuVabrGMdOp8AEsi4nqTGJgw',
        level: 'already known',
        reportReason: null,
        timestamp: 1637575634000,
        verifications: [
          {
            name: 'Aura',
            block: 30173280,
            timestamp: 1740433826802,
            domains: [
              {
                name: 'BrightID',
                categories: [
                  {
                    name: 'subject',
                    score: 201304944.16408563,
                    level: 2,
                    impacts: [
                      {
                        evaluator:
                          'HxZfz3ipSp0rHsOhJQlievFqjV3DnU8BE6vhqNSecBM',
                        level: 1,
                        score: 100652472.08204281,
                        confidence: 2,
                        impact: 201304944.16408563,
                      },
                    ],
                  },
                ],
              },
            ],
          },
          {
            name: 'SeedConnected',
            rank: 1,
            connected: ['ufl4PdK91Qf_1Efb61chYN6Sa6BZjU8mjPSqBbrDhDk'],
            communities: ['ufl4PdK91Qf_1Efb61chYN6Sa6BZjU8mjPSqBbrDhDk'],
            reported: [],
            block: 30173280,
            timestamp: 1740433831826,
            hash: 'HjcuqSxwya-XKvpg2zd2H4gtWvWbPYsKieFQMSjQ84I',
          },
          {
            name: 'SeedConnectedWithFriend',
            friend: 'uMTsfS0b3Uwz26FEHcYgcLzDOWI_Ce_3PWGKJLMG-nI',
            block: 30173280,
            timestamp: 1740433850295,
            hash: 'IW-Tav9UyP14cac3dswD5olD8x3FfU6zyNz-uNoIKAc',
          },
          {
            name: 'BrightID',
            block: 30173280,
            timestamp: 1740433854326,
            hash: 'p458wA4hw9ZXhAmsdTN6ajy8CF5J9jNb-lPB1iwloI4',
          },
          {
            name: 'SocialRecoverySetup',
            block: 30173280,
            timestamp: 1740433870443,
            hash: 'OFo0W8ihQvECsPExPY_kaV9HYm78WCafTKGY5OOpGaY',
          },
          {
            name: 'Bitu',
            releaseTime: 1653882066611,
            linksNum: 12,
            confirmedScore: 12,
            directReports: {},
            indirectReports: {},
            reportedConnections: {},
            score: 0,
            block: 30173280,
            timestamp: 1740433875239,
            hash: 'en1CiHmrIlCEAew-oPnxUiyLxsqvZKAP4I_jepmFZUE',
          },
        ],
      },
      {
        id: 'NYJRCfG1rAFr-FtHreeF9TDrhSqIZguiCt0pj2U9aps',
        level: 'recovery',
        reportReason: null,
        timestamp: 1637575639000,
        verifications: [
          {
            name: 'Aura',
            block: 30173280,
            timestamp: 1740433826802,
            domains: [
              {
                name: 'BrightID',
                categories: [
                  {
                    name: 'player',
                    score: 0,
                    level: 0,
                    impacts: [
                      {
                        evaluator:
                          'HxZfz3ipSp0rHsOhJQlievFqjV3DnU8BE6vhqNSecBM',
                        level: null,
                        score: null,
                        confidence: 1,
                        impact: 0,
                      },
                    ],
                  },
                  {
                    name: 'subject',
                    score: 402609888.32817125,
                    level: 2,
                    impacts: [
                      {
                        evaluator:
                          'HxZfz3ipSp0rHsOhJQlievFqjV3DnU8BE6vhqNSecBM',
                        level: 1,
                        score: 100652472.08204281,
                        confidence: 4,
                        impact: 402609888.32817125,
                      },
                    ],
                  },
                ],
              },
            ],
          },
          {
            name: 'Seed',
            block: 30173280,
            timestamp: 1740433826885,
            hash: '4KYwEQSAn3MbkvzElo4eYGWSa1Yr4ZbpbLO_LDynLOg',
          },
          {
            name: 'SeedConnected',
            rank: 3,
            connected: [
              'Pr5SHCQkGvSc',
              'ufl4PdK91Qf_1Efb61chYN6Sa6BZjU8mjPSqBbrDhDk',
              'sVYW_wqVAxaoT2K1Va9duLjQ1jmgnUuvVP82bPDrAL8',
            ],
            communities: [
              'Pr5SHCQkGvSc',
              'ufl4PdK91Qf_1Efb61chYN6Sa6BZjU8mjPSqBbrDhDk',
              'sVYW_wqVAxaoT2K1Va9duLjQ1jmgnUuvVP82bPDrAL8',
            ],
            reported: [],
            block: 30173280,
            timestamp: 1740433832834,
            hash: 'BHhs1G2TJZYquyMsPbYjq27E79yO9mojaLrAhXsZb4A',
          },
          {
            name: 'SeedConnectedWithFriend',
            friend: null,
            block: 30173280,
            timestamp: 1740433850176,
            hash: 'MMD77Z9nUENIU9toVhvd2WbCCMGp5QO1Q4QTThQpJSg',
          },
          {
            name: 'BrightID',
            block: 30173280,
            timestamp: 1740433855220,
            hash: 'I4J87oVPT77dOSir7Fl8v4KDyq2cCo5dXkHXSx8qvCQ',
          },
          {
            name: 'SocialRecoverySetup',
            block: 30173280,
            timestamp: 1740433873102,
            hash: 'uQgH__ySM6p-t9bdOrP5o9LV4tNnhrfbE6SnV06oCrU',
          },
          {
            name: 'Bitu',
            releaseTime: 1653882066611,
            linksNum: 6,
            confirmedScore: 6,
            directReports: {},
            indirectReports: {},
            reportedConnections: {},
            score: 0,
            block: 30173280,
            timestamp: 1740433875239,
            hash: 'EzLNFl_QMSluc7f4dL9FSE4D-tDRyrJ5NSiSdQenYh4',
          },
        ],
      },
      {
        id: 'oSDgBhs-mlnjyNTpljt-XC2pZN-PKhzxkEQFYbABtGA',
        level: 'recovery',
        reportReason: null,
        timestamp: 1637575639000,
        verifications: [
          {
            name: 'Aura',
            block: 30173280,
            timestamp: 1740433826802,
            domains: [
              {
                name: 'BrightID',
                categories: [
                  {
                    name: 'player',
                    score: 0,
                    level: 0,
                    impacts: [
                      {
                        evaluator:
                          'HxZfz3ipSp0rHsOhJQlievFqjV3DnU8BE6vhqNSecBM',
                        level: null,
                        score: null,
                        confidence: 1,
                        impact: 0,
                      },
                      {
                        evaluator:
                          '0wT96mjCAje7If7qjUyrzkVYBPoLPu3tfOzesdT3ShE',
                        level: null,
                        score: null,
                        confidence: 1,
                        impact: 0,
                      },
                    ],
                  },
                  {
                    name: 'subject',
                    score: 1162561230.953595,
                    level: 4,
                    impacts: [
                      {
                        evaluator:
                          's56WKMXMz5TdXdCYVO1XKekrWo-jYhODN6GFH9QdhwE',
                        level: 3,
                        score: 134867285.85970923,
                        confidence: 4,
                        impact: 539469143.4388369,
                      },
                      {
                        evaluator:
                          'HxZfz3ipSp0rHsOhJQlievFqjV3DnU8BE6vhqNSecBM',
                        level: 1,
                        score: 100652472.08204281,
                        confidence: 4,
                        impact: 402609888.32817125,
                      },
                      {
                        evaluator:
                          '0wT96mjCAje7If7qjUyrzkVYBPoLPu3tfOzesdT3ShE',
                        level: 1,
                        score: 73494066.39552891,
                        confidence: 3,
                        impact: 220482199.18658674,
                      },
                    ],
                  },
                ],
              },
            ],
          },
          {
            name: 'Seed',
            block: 30173280,
            timestamp: 1740433826884,
            hash: 'b61b2MGx0aDbVpqqXvFkEu82EDXVplL4Ie9ewhr_ibo',
          },
          {
            name: 'SeedConnected',
            rank: 2,
            connected: [
              'Pr5SHCQkGvSc',
              'ufl4PdK91Qf_1Efb61chYN6Sa6BZjU8mjPSqBbrDhDk',
            ],
            communities: [
              'Pr5SHCQkGvSc',
              'ufl4PdK91Qf_1Efb61chYN6Sa6BZjU8mjPSqBbrDhDk',
              'Tf6Wtwlhjy3gydBvGsdPgVH0ttZXM-SOeFZIZePvZdg',
            ],
            reported: [],
            block: 30173280,
            timestamp: 1740433832834,
            hash: 'VpRAB7lXQgDGgueGaPxkftLR5nRjq3l7WzmcaqlGoGw',
          },
          {
            name: 'SeedConnectedWithFriend',
            friend: null,
            block: 30173280,
            timestamp: 1740433850176,
            hash: 'G2ntxHV_jWm995kQmraS9ZoZN4NemEvH3fG68FlBExo',
          },
          {
            name: 'BrightID',
            block: 30173280,
            timestamp: 1740433855220,
            hash: '1Yrd2aQhfUfwx-_1kuB7jArpd4pgjRPOo6cYUmlsd34',
          },
          {
            name: 'SocialRecoverySetup',
            block: 30173280,
            timestamp: 1740433873275,
            hash: 'P1ldQrdJP7yJdJI2lpai0gdss8uWgbITdGwyReVr4hQ',
          },
          {
            name: 'Bitu',
            releaseTime: 1653882066611,
            linksNum: 23,
            confirmedScore: 20,
            directReports: {},
            indirectReports: {
              j07qLQF84CppaMqy4hzHm8CU4JJ2dLuRzkSXkob51uE: -1,
              ShWqKn_CoxuNl3slAJ_krl8vEI7qqJ8sSNBfN8X9h5Q: -1,
              'sEmMDC-3mIaleVILSVXAfz2U6ycJ3madGXLa5UAhdh0': -1,
            },
            reportedConnections: {
              j07qLQF84CppaMqy4hzHm8CU4JJ2dLuRzkSXkob51uE: [
                'frLHtQ0nk-vgd99BAK9y-PLnN0UsO3FPrNs-Db-i9K8',
              ],
              ShWqKn_CoxuNl3slAJ_krl8vEI7qqJ8sSNBfN8X9h5Q: [
                'frLHtQ0nk-vgd99BAK9y-PLnN0UsO3FPrNs-Db-i9K8',
              ],
              'sEmMDC-3mIaleVILSVXAfz2U6ycJ3madGXLa5UAhdh0': [
                'frLHtQ0nk-vgd99BAK9y-PLnN0UsO3FPrNs-Db-i9K8',
              ],
            },
            score: 3,
            block: 30173280,
            timestamp: 1740433875238,
            hash: 'ew4Lb-8lgF3JoP256XhrZ8JPX6Zf54H07fF98bpv2nc',
          },
        ],
      },
      {
        id: 'HxZfz3ipSp0rHsOhJQlievFqjV3DnU8BE6vhqNSecBM',
        level: 'recovery',
        reportReason: null,
        timestamp: 1637575644000,
        verifications: [
          {
            name: 'Aura',
            block: 30173280,
            timestamp: 1740433826802,
            domains: [
              {
                name: 'BrightID',
                categories: [
                  {
                    name: 'player',
                    score: 100652472.08204281,
                    level: 1,
                    impacts: [
                      {
                        evaluator:
                          '1Ix6_UTI9FzFD9JVYeX7L-7P0cSt0uBEzoUBK_CL8QY',
                        level: 2,
                        score: 11702617.28153414,
                        confidence: 1,
                        impact: 11702617.28153414,
                      },
                      {
                        evaluator:
                          '0wT96mjCAje7If7qjUyrzkVYBPoLPu3tfOzesdT3ShE',
                        level: null,
                        score: null,
                        confidence: 1,
                        impact: 0,
                      },
                      {
                        evaluator:
                          'AsjAK5gJ68SMYvGfCAuROsMrJQ0_83ZS92xy94LlfIA',
                        level: 2,
                        score: 21564244.746546254,
                        confidence: 1,
                        impact: 21564244.746546254,
                      },
                      {
                        evaluator:
                          'AWtJ0wj7j1sFkZStsh6n3UvXsX3pGj9Oqgw2xMF9B_Y',
                        level: null,
                        score: null,
                        confidence: 1,
                        impact: 0,
                      },
                      {
                        evaluator:
                          '09w4r-qB7nfooRBN0_FmM9r5SwWfwpIn-x1rNTfE6IA',
                        level: 2,
                        score: 20670019.391396683,
                        confidence: 1,
                        impact: 20670019.391396683,
                      },
                      {
                        evaluator:
                          'UxYHGX4JtnUrYTZzVqbTLu9Azw5hAfDK1X7DLXp7_tQ',
                        level: 2,
                        score: 9441584.39018921,
                        confidence: 1,
                        impact: 9441584.39018921,
                      },
                      {
                        evaluator:
                          'v5mibmGr9W08lhCI1exZr4PLt4VV7s-nVoJXOVlN2kg',
                        level: 2,
                        score: 16176149.369096812,
                        confidence: 1,
                        impact: 16176149.369096812,
                      },
                      {
                        evaluator:
                          'xqmMHQMnBdakxs3sXXjy7qVqPoXmhhwOt4c_z1tSPwM',
                        level: 2,
                        score: 21097856.903279718,
                        confidence: 1,
                        impact: 21097856.903279718,
                      },
                      {
                        evaluator:
                          'pQU_kWrL6E7M3J9FIg4LLd0tBSwcPy7p8ziUe9cdrfo',
                        level: null,
                        score: null,
                        confidence: 1,
                        impact: 0,
                      },
                    ],
                  },
                  {
                    name: 'subject',
                    score: 5991870299.790419,
                    level: 4,
                    impacts: [
                      {
                        evaluator:
                          '1Ix6_UTI9FzFD9JVYeX7L-7P0cSt0uBEzoUBK_CL8QY',
                        level: 3,
                        score: 130206694.59939781,
                        confidence: 3,
                        impact: 390620083.79819345,
                      },
                      {
                        evaluator:
                          '0wT96mjCAje7If7qjUyrzkVYBPoLPu3tfOzesdT3ShE',
                        level: 1,
                        score: 73494066.39552891,
                        confidence: 4,
                        impact: 293976265.58211565,
                      },
                      {
                        evaluator:
                          'AsjAK5gJ68SMYvGfCAuROsMrJQ0_83ZS92xy94LlfIA',
                        level: 3,
                        score: 302332518.53370947,
                        confidence: 3,
                        impact: 906997555.6011283,
                      },
                      {
                        evaluator:
                          'AWtJ0wj7j1sFkZStsh6n3UvXsX3pGj9Oqgw2xMF9B_Y',
                        level: 3,
                        score: 152720819.208647,
                        confidence: 3,
                        impact: 458162457.62594104,
                      },
                      {
                        evaluator:
                          '09w4r-qB7nfooRBN0_FmM9r5SwWfwpIn-x1rNTfE6IA',
                        level: 3,
                        score: 203002315.72423297,
                        confidence: 4,
                        impact: 812009262.8969319,
                      },
                      {
                        evaluator:
                          'UxYHGX4JtnUrYTZzVqbTLu9Azw5hAfDK1X7DLXp7_tQ',
                        level: 3,
                        score: 244479365.61455446,
                        confidence: 2,
                        impact: 488958731.2291089,
                      },
                      {
                        evaluator:
                          'v5mibmGr9W08lhCI1exZr4PLt4VV7s-nVoJXOVlN2kg',
                        level: 3,
                        score: 301995876.24125063,
                        confidence: 3,
                        impact: 905987628.7237519,
                      },
                      {
                        evaluator:
                          'xqmMHQMnBdakxs3sXXjy7qVqPoXmhhwOt4c_z1tSPwM',
                        level: 3,
                        score: 283726707.50423574,
                        confidence: 3,
                        impact: 851180122.5127072,
                      },
                      {
                        evaluator:
                          'pQU_kWrL6E7M3J9FIg4LLd0tBSwcPy7p8ziUe9cdrfo',
                        level: 1,
                        score: 97610002.27358976,
                        confidence: 3,
                        impact: 292830006.8207693,
                      },
                      {
                        evaluator:
                          'OeNllgD2Q2K845Z_ANwah_9yTbJ5PFpvyY8zITkOuFs',
                        level: 3,
                        score: 197049394.99992335,
                        confidence: 3,
                        impact: 591148184.99977,
                      },
                    ],
                  },
                ],
              },
            ],
          },
          {
            name: 'SeedConnected',
            rank: 11,
            connected: [
              '3vqWfpOxP2fR',
              'hWIVtbx4VcSVAY1_r1bIH66QvS9RNFXJWGKTy_c5qxY',
              '---U49atc2d-z0HFP_0-qeml3rsj_I7Nsd7QA5aP7mc',
              'ufl4PdK91Qf_1Efb61chYN6Sa6BZjU8mjPSqBbrDhDk',
              'GYGbx74q6-pYRG4UHNfrMVyZ6ZIZQYUCSHhlBGkvBjE',
              'PbtXC7NF5bhiyrDoCShlg3iKK3d9bto_uxg9B4BGv9E',
              'vPmP-pkagrl02LrGgIaFf4aimR4rTrbnIcYT5t7q2w4',
              'bSGdH_RTE9CbHvBpx3Y08OUE0cw7fexp7y0M-9pD4S0',
              'sVYW_wqVAxaoT2K1Va9duLjQ1jmgnUuvVP82bPDrAL8',
              'lQ1kMUbQXuIW_2c_WxF5f6Ko8Gqg6eVaWuu9cQjZkYQ',
              'jutFlbXP0eJnJ2sPT8aibSYdYVde9XQZ_i-z96N9r1w',
            ],
            communities: [
              '3vqWfpOxP2fR',
              'hWIVtbx4VcSVAY1_r1bIH66QvS9RNFXJWGKTy_c5qxY',
              '---U49atc2d-z0HFP_0-qeml3rsj_I7Nsd7QA5aP7mc',
              'ufl4PdK91Qf_1Efb61chYN6Sa6BZjU8mjPSqBbrDhDk',
              'GYGbx74q6-pYRG4UHNfrMVyZ6ZIZQYUCSHhlBGkvBjE',
              'PbtXC7NF5bhiyrDoCShlg3iKK3d9bto_uxg9B4BGv9E',
              'vPmP-pkagrl02LrGgIaFf4aimR4rTrbnIcYT5t7q2w4',
              'bSGdH_RTE9CbHvBpx3Y08OUE0cw7fexp7y0M-9pD4S0',
              'sVYW_wqVAxaoT2K1Va9duLjQ1jmgnUuvVP82bPDrAL8',
              'lQ1kMUbQXuIW_2c_WxF5f6Ko8Gqg6eVaWuu9cQjZkYQ',
              'Pr5SHCQkGvSc',
              'Tf6Wtwlhjy3gydBvGsdPgVH0ttZXM-SOeFZIZePvZdg',
              'jutFlbXP0eJnJ2sPT8aibSYdYVde9XQZ_i-z96N9r1w',
            ],
            reported: [],
            block: 30173280,
            timestamp: 1740433832675,
            hash: 'A2kTTkiVZrJ9u-V7sQ3Phjcis1rqEm8bBilYa8oJ4MA',
          },
          {
            name: 'SeedConnectedWithFriend',
            friend: 'zUTCJG6Kdwzas63OAWol8F8qmYY_RqaULE0ip-wQT_g',
            block: 30173280,
            timestamp: 1740433850167,
            hash: 'vKLOdUrVtncxwqLUFyfTVodi4_JVml3wDYOH0K9LzWs',
          },
          {
            name: 'BrightID',
            block: 30173280,
            timestamp: 1740433855058,
            hash: 'cokvhQcL2S4mKh41ctCtH5J_3L7K6-8nTq266leBQ8I',
          },
          {
            name: 'SocialRecoverySetup',
            block: 30173280,
            timestamp: 1740433872194,
            hash: 'p8pkWz0nLpVtADykcR7Raec6sbH5S8t0ufDqdglO9dg',
          },
          {
            name: 'Bitu',
            releaseTime: 1653882066611,
            linksNum: 36,
            confirmedScore: 36,
            directReports: {},
            indirectReports: {},
            reportedConnections: {},
            score: 18,
            block: 30173280,
            timestamp: 1740433875234,
            hash: '4bIvaKdlu0iupXLNu3rWW3Echeher7JCCDCdhY74Ztk',
          },
        ],
      },
      {
        id: 'zTaT7-Cwe5eFg92rV3baAI6h8w1yjvW7of01OhI2V8k',
        level: 'already known',
        reportReason: null,
        timestamp: 1637575644000,
        verifications: [
          {
            name: 'Aura',
            block: 30173280,
            timestamp: 1740433826802,
            domains: [
              {
                name: 'BrightID',
                categories: [
                  {
                    name: 'player',
                    score: 0,
                    level: 0,
                    impacts: [
                      {
                        evaluator:
                          '3Oz-Gq2kEA_GSg6--vHNAbgZnbQ8Ryf9xPIFksn8XXU',
                        level: null,
                        score: null,
                        confidence: 1,
                        impact: 0,
                      },
                    ],
                  },
                  {
                    name: 'subject',
                    score: 696586153.9102869,
                    level: 2,
                    impacts: [
                      {
                        evaluator:
                          'HxZfz3ipSp0rHsOhJQlievFqjV3DnU8BE6vhqNSecBM',
                        level: 1,
                        score: 100652472.08204281,
                        confidence: 4,
                        impact: 402609888.32817125,
                      },
                      {
                        evaluator:
                          '0wT96mjCAje7If7qjUyrzkVYBPoLPu3tfOzesdT3ShE',
                        level: 1,
                        score: 73494066.39552891,
                        confidence: 4,
                        impact: 293976265.58211565,
                      },
                      {
                        evaluator:
                          '3Oz-Gq2kEA_GSg6--vHNAbgZnbQ8Ryf9xPIFksn8XXU',
                        level: null,
                        score: null,
                        confidence: 4,
                        impact: 0,
                      },
                    ],
                  },
                ],
              },
            ],
          },
          {
            name: 'SeedConnected',
            rank: 2,
            connected: [
              'sVYW_wqVAxaoT2K1Va9duLjQ1jmgnUuvVP82bPDrAL8',
              'ufl4PdK91Qf_1Efb61chYN6Sa6BZjU8mjPSqBbrDhDk',
            ],
            communities: [
              'sVYW_wqVAxaoT2K1Va9duLjQ1jmgnUuvVP82bPDrAL8',
              'ufl4PdK91Qf_1Efb61chYN6Sa6BZjU8mjPSqBbrDhDk',
              'Tf6Wtwlhjy3gydBvGsdPgVH0ttZXM-SOeFZIZePvZdg',
            ],
            reported: [],
            block: 30173280,
            timestamp: 1740433838761,
            hash: 'XXVXL8M_N6DZPdJ5kNlxF_sruDX27SVKlJ8ppnWzLrE',
          },
          {
            name: 'SeedConnectedWithFriend',
            friend: 'fA74PHRZFP_4r4Cu_3CqN2p614noBtmaFPqCeopU9Ng',
            block: 30173280,
            timestamp: 1740433850370,
            hash: 'Bf80PY7PnLI4C2yJbvmZJiNVh_9dPwYr8eCKrq5_ysA',
          },
          {
            name: 'BrightID',
            block: 30173280,
            timestamp: 1740433860149,
            hash: 'mmmVFDgPFBIi7TVFmDkLt2UabcWShxrPLVqWnwvqOOE',
          },
          {
            name: 'SocialRecoverySetup',
            block: 30173280,
            timestamp: 1740433875001,
            hash: 'HgmmzeY0kCZ7I76fQv0m_liaBg06sYa7CEvVkFzEwiU',
          },
          {
            name: 'Bitu',
            releaseTime: 1653882066611,
            linksNum: 5,
            confirmedScore: 5,
            directReports: {},
            indirectReports: {},
            reportedConnections: {},
            score: 0,
            block: 30173280,
            timestamp: 1740433875239,
            hash: '7haAWqydcjR6H3IscknnUCcUerRtSD6XezbNhqP8uLA',
          },
        ],
      },
      {
        id: 'fA74PHRZFP_4r4Cu_3CqN2p614noBtmaFPqCeopU9Ng',
        level: 'already known',
        reportReason: null,
        timestamp: 1637575654000,
        verifications: [
          {
            name: 'Aura',
            block: 30173280,
            timestamp: 1740433826802,
            domains: [
              {
                name: 'BrightID',
                categories: [
                  {
                    name: 'player',
                    score: 0,
                    level: 0,
                    impacts: [
                      {
                        evaluator:
                          '0wT96mjCAje7If7qjUyrzkVYBPoLPu3tfOzesdT3ShE',
                        level: null,
                        score: null,
                        confidence: 1,
                        impact: 0,
                      },
                    ],
                  },
                  {
                    name: 'subject',
                    score: 696586153.9102869,
                    level: 2,
                    impacts: [
                      {
                        evaluator:
                          'HxZfz3ipSp0rHsOhJQlievFqjV3DnU8BE6vhqNSecBM',
                        level: 1,
                        score: 100652472.08204281,
                        confidence: 4,
                        impact: 402609888.32817125,
                      },
                      {
                        evaluator:
                          '0wT96mjCAje7If7qjUyrzkVYBPoLPu3tfOzesdT3ShE',
                        level: 1,
                        score: 73494066.39552891,
                        confidence: 4,
                        impact: 293976265.58211565,
                      },
                    ],
                  },
                ],
              },
            ],
          },
          {
            name: 'SeedConnected',
            rank: 2,
            connected: [
              'sVYW_wqVAxaoT2K1Va9duLjQ1jmgnUuvVP82bPDrAL8',
              'ufl4PdK91Qf_1Efb61chYN6Sa6BZjU8mjPSqBbrDhDk',
            ],
            communities: [
              'sVYW_wqVAxaoT2K1Va9duLjQ1jmgnUuvVP82bPDrAL8',
              'ufl4PdK91Qf_1Efb61chYN6Sa6BZjU8mjPSqBbrDhDk',
              'Tf6Wtwlhjy3gydBvGsdPgVH0ttZXM-SOeFZIZePvZdg',
            ],
            reported: [],
            block: 30173280,
            timestamp: 1740433836124,
            hash: 'oqP2WBfeBuJ6R1b3VOs9Anid5c-VXc5feN9Ffp5VSdQ',
          },
          {
            name: 'SeedConnectedWithFriend',
            friend: 'HZgquyVgq1HIaPTBc19xcfHUZdiNatsSmEfQXNWYtUA',
            block: 30173280,
            timestamp: 1740433850284,
            hash: 'OY5IwfkoJIhUSMiI2IDVFh_gauXyq7ndz6L-Z36koI0',
          },
          {
            name: 'BrightID',
            block: 30173280,
            timestamp: 1740433858010,
            hash: '9zjRSAhzF_nHSx7QIKlqfw_EzVHlXY5I3vyLhF7Nskk',
          },
          {
            name: 'SocialRecoverySetup',
            block: 30173280,
            timestamp: 1740433871826,
            hash: 'UyRJfOjRxDNnz_bB5cwtHzcv2eQweDQGte8Rf4WxbOE',
          },
          {
            name: 'Bitu',
            releaseTime: 1653882066611,
            linksNum: 19,
            confirmedScore: 19,
            directReports: {},
            indirectReports: {},
            reportedConnections: {},
            score: 0,
            block: 30173280,
            timestamp: 1740433875239,
            hash: 'KMSR63SQlD50fk5nawnaYwK9jARpKLiJS9vdqAQQz9M',
          },
        ],
      },
      {
        id: 'TUnr9EjYPpUITRR3k5my7aGWghdv_Hdi3jVv15P1N3k',
        level: 'reported',
        reportReason: 'other',
        timestamp: 1640788021000,
        verifications: [
          {
            name: 'SeedConnected',
            rank: -1,
            connected: [
              'Pr5SHCQkGvSc',
              'ufl4PdK91Qf_1Efb61chYN6Sa6BZjU8mjPSqBbrDhDk',
            ],
            communities: [
              'Pr5SHCQkGvSc',
              'ufl4PdK91Qf_1Efb61chYN6Sa6BZjU8mjPSqBbrDhDk',
            ],
            reported: ['Tf6Wtwlhjy3gydBvGsdPgVH0ttZXM-SOeFZIZePvZdg'],
            block: 30173280,
            timestamp: 1740433832836,
            hash: '_-3UIWRysdYTEvs4rmqI6JVbyAcUYV2yxQUcVFPd_iQ',
          },
          {
            name: 'Bitu',
            releaseTime: 1653882066611,
            linksNum: 9,
            confirmedScore: -2,
            directReports: {
              'x8D-HX9bljRsxu0mWkVzMOJlyHmffQvnPrG9I-HTJbQ': -5,
              'frLHtQ0nk-vgd99BAK9y-PLnN0UsO3FPrNs-Db-i9K8': -5,
            },
            indirectReports: {
              j07qLQF84CppaMqy4hzHm8CU4JJ2dLuRzkSXkob51uE: -1,
            },
            reportedConnections: {
              j07qLQF84CppaMqy4hzHm8CU4JJ2dLuRzkSXkob51uE: [
                'frLHtQ0nk-vgd99BAK9y-PLnN0UsO3FPrNs-Db-i9K8',
              ],
            },
            score: 0,
            block: 30173280,
            timestamp: 1740433875239,
            hash: 'oMJ4vTDvObWYVu6M-J-ndCY32ZINnQnxsW9Ctx32rzE',
          },
        ],
      },
      {
        id: 'U6wAv_tJT-_y01GRxM8H21XNM5OJdG3QgjMK9f0cBrk',
        level: 'already known',
        reportReason: null,
        timestamp: 1640788046000,
        verifications: [
          {
            name: 'Aura',
            block: 30173280,
            timestamp: 1740433826802,
            domains: [
              {
                name: 'BrightID',
                categories: [
                  {
                    name: 'player',
                    score: 0,
                    level: 0,
                    impacts: [
                      {
                        evaluator:
                          'HxZfz3ipSp0rHsOhJQlievFqjV3DnU8BE6vhqNSecBM',
                        level: null,
                        score: null,
                        confidence: 1,
                        impact: 0,
                      },
                      {
                        evaluator:
                          '0wT96mjCAje7If7qjUyrzkVYBPoLPu3tfOzesdT3ShE',
                        level: null,
                        score: null,
                        confidence: 1,
                        impact: 0,
                      },
                    ],
                  },
                  {
                    name: 'subject',
                    score: 595933681.8282441,
                    level: 2,
                    impacts: [
                      {
                        evaluator:
                          'W8-lKWk_gHGXSEMwjCTy_c7XjAv61QgzVBrz29eqm_Y',
                        level: 0,
                        score: 0,
                        confidence: 2,
                        impact: 0,
                      },
                      {
                        evaluator:
                          'HxZfz3ipSp0rHsOhJQlievFqjV3DnU8BE6vhqNSecBM',
                        level: 1,
                        score: 100652472.08204281,
                        confidence: 3,
                        impact: 301957416.24612844,
                      },
                      {
                        evaluator:
                          '0wT96mjCAje7If7qjUyrzkVYBPoLPu3tfOzesdT3ShE',
                        level: 1,
                        score: 73494066.39552891,
                        confidence: 4,
                        impact: 293976265.58211565,
                      },
                    ],
                  },
                ],
              },
            ],
          },
          {
            name: 'SeedConnected',
            rank: 3,
            connected: [
              'Pr5SHCQkGvSc',
              'sVYW_wqVAxaoT2K1Va9duLjQ1jmgnUuvVP82bPDrAL8',
              'ufl4PdK91Qf_1Efb61chYN6Sa6BZjU8mjPSqBbrDhDk',
            ],
            communities: [
              'Pr5SHCQkGvSc',
              'sVYW_wqVAxaoT2K1Va9duLjQ1jmgnUuvVP82bPDrAL8',
              'ufl4PdK91Qf_1Efb61chYN6Sa6BZjU8mjPSqBbrDhDk',
              '3vqWfpOxP2fR',
            ],
            reported: [],
            block: 30173280,
            timestamp: 1740433832834,
            hash: 'LVyy4VaWY-nRUL6rRT5iV8m6F8wCx_nkWQ82Xvw_Ojw',
          },
          {
            name: 'SeedConnectedWithFriend',
            friend: 'fHo0fiNsrnMf1sMtb1_l5u7Kl0RCchjfiBLYEGveSPs',
            block: 30173280,
            timestamp: 1740433850289,
            hash: '85hHyBn5Zpk9rI3mUHfAfqIidRRFfyuk1qisq2aBHbI',
          },
          {
            name: 'BrightID',
            block: 30173280,
            timestamp: 1740433855220,
            hash: 'J0e4goEGsMRM9XpqfxItPN17oSSDlH01YEEwRZsVtHs',
          },
          {
            name: 'SocialRecoverySetup',
            block: 30173280,
            timestamp: 1740433874144,
            hash: 'Y1KOJYOkEFEXhDHJjDgxrmo1XuDkF20DphliV4MPsIs',
          },
          {
            name: 'Bitu',
            releaseTime: 1653882066611,
            linksNum: 24,
            confirmedScore: 24,
            directReports: {},
            indirectReports: {},
            reportedConnections: {},
            score: 0,
            block: 30173280,
            timestamp: 1740433875239,
            hash: 'FXtNkM70NzVVlX8K-l8JnHFOpNGlIEPkf3UOeTAu30M',
          },
        ],
      },
      {
        id: 'XrqbrQ8fyvXARhz062jxpKtTn3W57mQFbXJq6xCLMwI',
        level: 'already known',
        reportReason: null,
        timestamp: 1640788051000,
        verifications: [
          {
            name: 'Aura',
            block: 30173280,
            timestamp: 1740433826802,
            domains: [
              {
                name: 'BrightID',
                categories: [
                  {
                    name: 'player',
                    score: 0,
                    level: 0,
                    impacts: [
                      {
                        evaluator:
                          '0wT96mjCAje7If7qjUyrzkVYBPoLPu3tfOzesdT3ShE',
                        level: null,
                        score: null,
                        confidence: 1,
                        impact: 0,
                      },
                    ],
                  },
                  {
                    name: 'subject',
                    score: 293976265.58211565,
                    level: 2,
                    impacts: [
                      {
                        evaluator:
                          '0wT96mjCAje7If7qjUyrzkVYBPoLPu3tfOzesdT3ShE',
                        level: 1,
                        score: 73494066.39552891,
                        confidence: 4,
                        impact: 293976265.58211565,
                      },
                    ],
                  },
                ],
              },
            ],
          },
          {
            name: 'SeedConnected',
            rank: 2,
            connected: [
              'sVYW_wqVAxaoT2K1Va9duLjQ1jmgnUuvVP82bPDrAL8',
              'ufl4PdK91Qf_1Efb61chYN6Sa6BZjU8mjPSqBbrDhDk',
            ],
            communities: [
              'sVYW_wqVAxaoT2K1Va9duLjQ1jmgnUuvVP82bPDrAL8',
              'ufl4PdK91Qf_1Efb61chYN6Sa6BZjU8mjPSqBbrDhDk',
            ],
            reported: [],
            block: 30173280,
            timestamp: 1740433836754,
            hash: 'tZuXJqZKxexttlYGCt60K_0hUWf1SKan52n0Q0ZojlI',
          },
          {
            name: 'SeedConnectedWithFriend',
            friend: 'AScS-mBebqwCIpC1STaQ2ZS_iQmiQMX_eGSN4SUydHo',
            block: 30173280,
            timestamp: 1740433850322,
            hash: 'yis1iNO60-m4TQxQm--_SEMIByPopDVnaM88eaSVo2c',
          },
          {
            name: 'BrightID',
            block: 30173280,
            timestamp: 1740433858520,
            hash: 'iXZGsLA_6NgRzr-dHsh90GkLm-QTW66OkpOJPYEC0sQ',
          },
          {
            name: 'SocialRecoverySetup',
            block: 30173280,
            timestamp: 1740433874632,
            hash: 'TWQOE-SRVx21UPYAcsXxT-Gfgxf2InToFDgHNEVXXFc',
          },
          {
            name: 'Bitu',
            releaseTime: 1653882066611,
            linksNum: 14,
            confirmedScore: 14,
            directReports: {},
            indirectReports: {},
            reportedConnections: {},
            score: 0,
            block: 30173280,
            timestamp: 1740433875239,
            hash: 'qhfOBVbIRAdVfyeGwCtkNq4lzHtKem1Uhot7sD4KNG0',
          },
        ],
      },
      {
        id: 'GpXzl-1PrO-K62PEKIFXGjKAii94h0VmIzzaEgHNRzc',
        level: 'already known',
        reportReason: null,
        timestamp: 1640788056000,
        verifications: [
          {
            name: 'Aura',
            block: 30173280,
            timestamp: 1740433826802,
            domains: [
              {
                name: 'BrightID',
                categories: [
                  {
                    name: 'subject',
                    score: 539469143.4388369,
                    level: 4,
                    impacts: [
                      {
                        evaluator:
                          's56WKMXMz5TdXdCYVO1XKekrWo-jYhODN6GFH9QdhwE',
                        level: 3,
                        score: 134867285.85970923,
                        confidence: 4,
                        impact: 539469143.4388369,
                      },
                    ],
                  },
                ],
              },
            ],
          },
          {
            name: 'SeedConnected',
            rank: 2,
            connected: [
              'sVYW_wqVAxaoT2K1Va9duLjQ1jmgnUuvVP82bPDrAL8',
              'ufl4PdK91Qf_1Efb61chYN6Sa6BZjU8mjPSqBbrDhDk',
            ],
            communities: [
              'sVYW_wqVAxaoT2K1Va9duLjQ1jmgnUuvVP82bPDrAL8',
              'ufl4PdK91Qf_1Efb61chYN6Sa6BZjU8mjPSqBbrDhDk',
            ],
            reported: [],
            block: 30173280,
            timestamp: 1740433836548,
            hash: 'fQ57GKz02_MRxFG33TqNHxrn1t3XwH94_-goXqPn4u8',
          },
          {
            name: 'SeedConnectedWithFriend',
            friend: 'XrqbrQ8fyvXARhz062jxpKtTn3W57mQFbXJq6xCLMwI',
            block: 30173280,
            timestamp: 1740433850376,
            hash: 'YkadZ6kQtrGZ_4yOJorVhPLO78d19WFt6ramIwRvnNA',
          },
          {
            name: 'BrightID',
            block: 30173280,
            timestamp: 1740433858343,
            hash: '9bz-1pPKEif0CUV3hVan7g_qiV7I-PtzY7UbRm5EWUY',
          },
          {
            name: 'SocialRecoverySetup',
            block: 30173280,
            timestamp: 1740433872014,
            hash: 'ClnAIPMDZjtY0D7AD9HtMHfgl8vQZiLZ1tRUagsUvGI',
          },
          {
            name: 'Bitu',
            releaseTime: 1653882066611,
            linksNum: 9,
            confirmedScore: 9,
            directReports: {},
            indirectReports: {},
            reportedConnections: {},
            score: 0,
            block: 30173280,
            timestamp: 1740433875239,
            hash: '1qzgfS4vOw8vNEpJiT1SYPnG6VIiKz4UZqJsA44Av5M',
          },
        ],
      },
      {
        id: 'frLHtQ0nk-vgd99BAK9y-PLnN0UsO3FPrNs-Db-i9K8',
        level: 'already known',
        reportReason: null,
        timestamp: 1640796624000,
        verifications: [
          {
            name: 'Aura',
            block: 30173280,
            timestamp: 1740433826802,
            domains: [
              {
                name: 'BrightID',
                categories: [
                  {
                    name: 'subject',
                    score: 402609888.32817125,
                    level: 2,
                    impacts: [
                      {
                        evaluator:
                          'HxZfz3ipSp0rHsOhJQlievFqjV3DnU8BE6vhqNSecBM',
                        level: 1,
                        score: 100652472.08204281,
                        confidence: 4,
                        impact: 402609888.32817125,
                      },
                    ],
                  },
                ],
              },
            ],
          },
          {
            name: 'Seed',
            block: 30173280,
            timestamp: 1740433826885,
            hash: '0UqwVdIfWOC_oI4u6Wqc1Pg4bcuDqHlgv_5XnKWuDws',
          },
          {
            name: 'SeedConnected',
            rank: 3,
            connected: [
              'Pr5SHCQkGvSc',
              'sVYW_wqVAxaoT2K1Va9duLjQ1jmgnUuvVP82bPDrAL8',
              'ufl4PdK91Qf_1Efb61chYN6Sa6BZjU8mjPSqBbrDhDk',
            ],
            communities: [
              'Pr5SHCQkGvSc',
              'sVYW_wqVAxaoT2K1Va9duLjQ1jmgnUuvVP82bPDrAL8',
              'ufl4PdK91Qf_1Efb61chYN6Sa6BZjU8mjPSqBbrDhDk',
            ],
            reported: [],
            block: 30173280,
            timestamp: 1740433832835,
            hash: '4T5jYE0Tr9tGJreY2rYtJcjhtXpbqXzB-sBJbjwcKsU',
          },
          {
            name: 'SeedConnectedWithFriend',
            friend: null,
            block: 30173280,
            timestamp: 1740433850176,
            hash: 'HXcNMI0pcVa5X1QP-C7jFi4tERajUckce49A_WW8w-w',
          },
          {
            name: 'BrightID',
            block: 30173280,
            timestamp: 1740433855220,
            hash: 'vbjU_LVAIyGG_bhU2Oh_PV0rjZRu2sTXPFgJTDU1mZ4',
          },
          {
            name: 'SocialRecoverySetup',
            block: 30173280,
            timestamp: 1740433871836,
            hash: 'h83X25wOgYojlHog_fzK992K5xP3CAmmVOfjlJW9ujQ',
          },
          {
            name: 'Bitu',
            releaseTime: 1653882066611,
            linksNum: 19,
            confirmedScore: 19,
            directReports: {},
            indirectReports: {},
            reportedConnections: {},
            score: 0,
            block: 30173280,
            timestamp: 1740433875243,
            hash: 'EpdwHYXNraMz9gEBKWf8JUS_Xrnicv5v8l3Zgas3NJE',
          },
        ],
      },
      {
        id: 'r3EQTuwSzDg2PquYelbFBh5rF2Vh03d21M48laoeBOo',
        level: 'already known',
        reportReason: null,
        timestamp: 1640861319000,
        verifications: [
          {
            name: 'SeedConnected',
            rank: 1,
            connected: ['-z6lbLFK4yxj1YmrUz7dYttceEg1XWZRoD_V8xE8qC0'],
            communities: ['-z6lbLFK4yxj1YmrUz7dYttceEg1XWZRoD_V8xE8qC0'],
            reported: [],
            block: 30173280,
            timestamp: 1740433831821,
            hash: 'ZrlR5LuyWQvnx7cj5r2QcP39HKdpvl6wuouVD_AMM7U',
          },
          {
            name: 'SeedConnectedWithFriend',
            friend: 'qIgcVTJR543Oj1Efi1l0jfxfuISDPlALDS49ap8bf5s',
            block: 30173280,
            timestamp: 1740433850322,
            hash: '5wueWfGfnlpKp-sY9GuZ6e_5kjew6puOAalw97pJC3Y',
          },
          {
            name: 'BrightID',
            block: 30173280,
            timestamp: 1740433854322,
            hash: 'CUVZjXdJo41wvTD9uGVxfyGJzaCwJwb6A-gUAu5I6VU',
          },
          {
            name: 'SocialRecoverySetup',
            block: 30173280,
            timestamp: 1740433873616,
            hash: 'oHGOq89qQ-3ONz8yzZas1D7tbPbhyeLpNcf_mUjhRU8',
          },
          {
            name: 'Bitu',
            releaseTime: 1653882066611,
            linksNum: 12,
            confirmedScore: 12,
            directReports: {},
            indirectReports: {},
            reportedConnections: {},
            score: 0,
            block: 30173280,
            timestamp: 1740433875243,
            hash: 'Q59iojUPzaMzYx5ya4NHZYuqBmMExYD9roIdAid8tAY',
          },
        ],
      },
      {
        id: 'EEuKmfH1cROyXITQ22Ww_jICMxtcS91DEl4im_NTbEw',
        level: 'already known',
        reportReason: null,
        timestamp: 1654506223000,
        verifications: [
          {
            name: 'SeedConnected',
            rank: 1,
            connected: ['ufl4PdK91Qf_1Efb61chYN6Sa6BZjU8mjPSqBbrDhDk'],
            communities: [
              'Pr5SHCQkGvSc',
              'Tf6Wtwlhjy3gydBvGsdPgVH0ttZXM-SOeFZIZePvZdg',
              'ufl4PdK91Qf_1Efb61chYN6Sa6BZjU8mjPSqBbrDhDk',
            ],
            reported: [],
            block: 30173280,
            timestamp: 1740433841741,
            hash: 'bOIKm_1yT-jevRhXFFuG883OnKxfZUGnB229mLLaArU',
          },
          {
            name: 'BrightID',
            block: 30173280,
            timestamp: 1740433863013,
            hash: 'lJnxT_qjmYeUoPwEUkGmNU_4dUWe_1wfdoJbxlQJdy8',
          },
          {
            name: 'SocialRecoverySetup',
            block: 30173280,
            timestamp: 1740433871669,
            hash: 'g8WlA6gXWk__-hV1scXv15T2UMxxbKTGtHF0CHSrSCQ',
          },
        ],
      },
      {
        id: 'lVU3DXtzpzrdZLGTHRiDV3V2R8KWqZo5XdT8sGc3jG4',
        level: 'already known',
        reportReason: null,
        timestamp: 1684068844000,
        verifications: [
          {
            name: 'SeedConnected',
            rank: 1,
            connected: ['ufl4PdK91Qf_1Efb61chYN6Sa6BZjU8mjPSqBbrDhDk'],
            communities: [
              'Pr5SHCQkGvSc',
              'Tf6Wtwlhjy3gydBvGsdPgVH0ttZXM-SOeFZIZePvZdg',
              'ufl4PdK91Qf_1Efb61chYN6Sa6BZjU8mjPSqBbrDhDk',
            ],
            reported: [],
            block: 30173280,
            timestamp: 1740433844500,
            hash: 'njeKoZZcP5IcWpotVikvAdUOJx8Q2371cH3IP2MbeDU',
          },
          {
            name: 'BrightID',
            block: 30173280,
            timestamp: 1740433865639,
            hash: 'YznhkPWYnJGU0e-477d21tZMrliLI8R8W3D7oZz7hzo',
          },
          {
            name: 'SocialRecoverySetup',
            block: 30173280,
            timestamp: 1740433872911,
            hash: 'RMSZ_z2MTdFCk4v7qcjVLMp45oeVf2JXzd7xQrGQmrI',
          },
        ],
      },
      {
        id: '3Oz-Gq2kEA_GSg6--vHNAbgZnbQ8Ryf9xPIFksn8XXU',
        level: 'already known',
        reportReason: null,
        timestamp: 1688065994000,
        verifications: [
          {
            name: 'Aura',
            block: 30173280,
            timestamp: 1740433826802,
            domains: [
              {
                name: 'BrightID',
                categories: [
                  {
                    name: 'subject',
                    score: 539469143.4388369,
                    level: 4,
                    impacts: [
                      {
                        evaluator:
                          's56WKMXMz5TdXdCYVO1XKekrWo-jYhODN6GFH9QdhwE',
                        level: 3,
                        score: 134867285.85970923,
                        confidence: 4,
                        impact: 539469143.4388369,
                      },
                    ],
                  },
                ],
              },
            ],
          },
          {
            name: 'SeedConnected',
            rank: 1,
            connected: ['ufl4PdK91Qf_1Efb61chYN6Sa6BZjU8mjPSqBbrDhDk'],
            communities: [
              'Pr5SHCQkGvSc',
              'Tf6Wtwlhjy3gydBvGsdPgVH0ttZXM-SOeFZIZePvZdg',
              'ufl4PdK91Qf_1Efb61chYN6Sa6BZjU8mjPSqBbrDhDk',
              '3vqWfpOxP2fR',
            ],
            reported: [],
            block: 30173280,
            timestamp: 1740433842571,
            hash: 'o9VohBEvzyB_R2LlLgF42ywdlRadLsB3cQlC-SzAWJU',
          },
          {
            name: 'BrightID',
            block: 30173280,
            timestamp: 1740433863713,
            hash: 'A4lf6ni6LiVYzi25PvXEGyrHPUWO5-XcLEtjSKcinT8',
          },
          {
            name: 'SocialRecoverySetup',
            block: 30173280,
            timestamp: 1740433870602,
            hash: 'VwIzeDMQcBHBa4OWFIiDhOsYZEYkLcecYMQqlqycUwQ',
          },
          {
            name: 'Bitu',
            linksNum: 0,
            confirmedScore: 0,
            score: 11,
            directReports: {},
            indirectReports: {},
            reportedConnections: {},
            releaseTime: 0,
            block: 30173280,
            timestamp: 1740433877823,
            hash: 'aoJTndiB3Yw7lVQIZO85l7-83H7Ddj7IR8-HA9_A3sc',
          },
        ],
      },
      {
        id: 'HsKfPmmRtoaws5CQd44Z8u6FhtftTESyL_Q1HT30htQ',
        level: 'already known',
        reportReason: null,
        timestamp: 1728395208000,
        verifications: [
          {
            name: 'Aura',
            block: 30173280,
            timestamp: 1740433826802,
            domains: [
              {
                name: 'BrightID',
                categories: [
                  {
                    name: 'manager',
                    score: 522314.2113015379,
                    level: 2,
                    impacts: [
                      {
                        evaluator:
                          'AsjAK5gJ68SMYvGfCAuROsMrJQ0_83ZS92xy94LlfIA',
                        score: 248561.8394850427,
                        confidence: 0,
                        impact: 0,
                      },
                      {
                        evaluator:
                          'xqmMHQMnBdakxs3sXXjy7qVqPoXmhhwOt4c_z1tSPwM',
                        score: 238713.846568868,
                        confidence: 1,
                        impact: 238713.846568868,
                      },
                      {
                        evaluator:
                          'UxYHGX4JtnUrYTZzVqbTLu9Azw5hAfDK1X7DLXp7_tQ',
                        score: 141800.18236633495,
                        confidence: 2,
                        impact: 283600.3647326699,
                      },
                    ],
                  },
                  {
                    name: 'trainer',
                    score: 7108554.950436223,
                    level: 2,
                    impacts: [
                      {
                        evaluator:
                          'AsjAK5gJ68SMYvGfCAuROsMrJQ0_83ZS92xy94LlfIA',
                        level: 2,
                        score: 2094172.540306506,
                        confidence: 0,
                        impact: 0,
                      },
                      {
                        evaluator:
                          'xqmMHQMnBdakxs3sXXjy7qVqPoXmhhwOt4c_z1tSPwM',
                        level: 2,
                        score: 2210769.501123139,
                        confidence: 1,
                        impact: 2210769.501123139,
                      },
                      {
                        evaluator:
                          'xqmMHQMnBdakxs3sXXjy7qVqPoXmhhwOt4c_z1tSPwM',
                        level: 2,
                        score: 2210769.501123139,
                        confidence: 1,
                        impact: 2210769.501123139,
                      },
                      {
                        evaluator:
                          'UxYHGX4JtnUrYTZzVqbTLu9Azw5hAfDK1X7DLXp7_tQ',
                        level: 2,
                        score: 1343507.9740949725,
                        confidence: 2,
                        impact: 2687015.948189945,
                      },
                    ],
                  },
                  {
                    name: 'player',
                    score: 104207372.08003037,
                    level: 3,
                    impacts: [
                      {
                        evaluator:
                          'AsjAK5gJ68SMYvGfCAuROsMrJQ0_83ZS92xy94LlfIA',
                        level: 2,
                        score: 21564244.746546254,
                        confidence: 2,
                        impact: 43128489.49309251,
                      },
                      {
                        evaluator:
                          'xqmMHQMnBdakxs3sXXjy7qVqPoXmhhwOt4c_z1tSPwM',
                        level: 2,
                        score: 21097856.903279718,
                        confidence: 1,
                        impact: 21097856.903279718,
                      },
                      {
                        evaluator:
                          'xqmMHQMnBdakxs3sXXjy7qVqPoXmhhwOt4c_z1tSPwM',
                        level: 2,
                        score: 21097856.903279718,
                        confidence: 1,
                        impact: 21097856.903279718,
                      },
                      {
                        evaluator:
                          'UxYHGX4JtnUrYTZzVqbTLu9Azw5hAfDK1X7DLXp7_tQ',
                        level: 2,
                        score: 9441584.39018921,
                        confidence: 2,
                        impact: 18883168.78037842,
                      },
                    ],
                  },
                  {
                    name: 'subject',
                    score: 3076665074.1180677,
                    level: 4,
                    impacts: [
                      {
                        evaluator:
                          'AsjAK5gJ68SMYvGfCAuROsMrJQ0_83ZS92xy94LlfIA',
                        level: 3,
                        score: 302332518.53370947,
                        confidence: 1,
                        impact: 302332518.53370947,
                      },
                      {
                        evaluator:
                          'xqmMHQMnBdakxs3sXXjy7qVqPoXmhhwOt4c_z1tSPwM',
                        level: 3,
                        score: 283726707.50423574,
                        confidence: 2,
                        impact: 567453415.0084715,
                      },
                      {
                        evaluator:
                          'xqmMHQMnBdakxs3sXXjy7qVqPoXmhhwOt4c_z1tSPwM',
                        level: 3,
                        score: 283726707.50423574,
                        confidence: 2,
                        impact: 567453415.0084715,
                      },
                      {
                        evaluator:
                          'UxYHGX4JtnUrYTZzVqbTLu9Azw5hAfDK1X7DLXp7_tQ',
                        level: 3,
                        score: 244479365.61455446,
                        confidence: 3,
                        impact: 733438096.8436635,
                      },
                      {
                        evaluator:
                          'v5mibmGr9W08lhCI1exZr4PLt4VV7s-nVoJXOVlN2kg',
                        level: 3,
                        score: 301995876.24125063,
                        confidence: 3,
                        impact: 905987628.7237519,
                      },
                    ],
                  },
                ],
              },
            ],
          },
          {
            name: 'SeedConnected',
            rank: 9,
            connected: [
              'ufl4PdK91Qf_1Efb61chYN6Sa6BZjU8mjPSqBbrDhDk',
              'rTRQfFHu79WSyd-dOAG0Q_wCZEKNCER3ugevL5S6yl0',
              'lQ1kMUbQXuIW_2c_WxF5f6Ko8Gqg6eVaWuu9cQjZkYQ',
              'qOKewbkPJTnu7rVAA8j3NTCt7EaBZ5fm_cJfEqCHTas',
              'jutFlbXP0eJnJ2sPT8aibSYdYVde9XQZ_i-z96N9r1w',
              '8k0uJqf0wtapuC4K2aLPCk9IUe5fv_w33gt5twFI6Go',
              'hWIVtbx4VcSVAY1_r1bIH66QvS9RNFXJWGKTy_c5qxY',
              'vPmP-pkagrl02LrGgIaFf4aimR4rTrbnIcYT5t7q2w4',
              'c_QZZoYP75fmP_FRxF1kDyHrhQYtvqPRLb-8okABb5s',
            ],
            communities: [
              'Pr5SHCQkGvSc',
              'Tf6Wtwlhjy3gydBvGsdPgVH0ttZXM-SOeFZIZePvZdg',
              'ufl4PdK91Qf_1Efb61chYN6Sa6BZjU8mjPSqBbrDhDk',
              'rTRQfFHu79WSyd-dOAG0Q_wCZEKNCER3ugevL5S6yl0',
              '-z6lbLFK4yxj1YmrUz7dYttceEg1XWZRoD_V8xE8qC0',
              '3vqWfpOxP2fR',
              'Dbu8rcx59Cml',
              'ETxf2qlnq4Kh',
              'mKkG_Vk0fOoy',
              'lQ1kMUbQXuIW_2c_WxF5f6Ko8Gqg6eVaWuu9cQjZkYQ',
              'qOKewbkPJTnu7rVAA8j3NTCt7EaBZ5fm_cJfEqCHTas',
              'jutFlbXP0eJnJ2sPT8aibSYdYVde9XQZ_i-z96N9r1w',
              '8k0uJqf0wtapuC4K2aLPCk9IUe5fv_w33gt5twFI6Go',
              'oD8jAEuJx1NuNuZnb4AkHiJPtQDn0fIApyHjimFsS6I',
              'f7koQjPrKUaFTBjwW3-AT1o9TRQFfTk0STNHuKi-b8M',
              'hWIVtbx4VcSVAY1_r1bIH66QvS9RNFXJWGKTy_c5qxY',
              'GYGbx74q6-pYRG4UHNfrMVyZ6ZIZQYUCSHhlBGkvBjE',
              'vPmP-pkagrl02LrGgIaFf4aimR4rTrbnIcYT5t7q2w4',
              'c_QZZoYP75fmP_FRxF1kDyHrhQYtvqPRLb-8okABb5s',
            ],
            reported: [],
            block: 30173280,
            timestamp: 1740433847321,
            hash: 'Fi6U-b5QrZXwlhjlG2npxjqHgcIUaHK_bvyHIMAji7I',
          },
          {
            name: 'BrightID',
            block: 30173280,
            timestamp: 1740433868214,
            hash: 'YxNGf1mFZT3o66FZoqYa0CGNd4QtGlIebClkG_HpBjU',
          },
          {
            name: 'SocialRecoverySetup',
            block: 30173280,
            timestamp: 1740433872191,
            hash: 'UX-SVGYoe-zFTLXIXfg9OiWFQ7dWFG0-I0u2ZH83xPM',
          },
          {
            name: 'Bitu',
            linksNum: 0,
            confirmedScore: 0,
            score: 3,
            directReports: {},
            indirectReports: {},
            reportedConnections: {},
            releaseTime: 0,
            block: 30173280,
            timestamp: 1740433878046,
            hash: 'hX7h1o5ErMuUjikClmp2NTI6alkd6VSfoFE-Z6rsSTs',
          },
        ],
      },
    ],
  },
};
