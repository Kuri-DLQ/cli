// const promise1 = () => {
//   return new Promise((resolve, reject) => {
//     setTimeout(() => {
//       resolve('first')
//     }, 5000)
//   })
// }

// const promise2 = () => {
//   return new Promise((resolve, reject) => {
//     setTimeout(() => {
//       resolve('second')
//     }, 3000)
//   })
// }

// const promise3 = () => {
//   return new Promise((resolve, reject) => {
//     setTimeout(() => {
//       resolve('third')
//     }, 1000)
//   })
// }

// const reqs = [promise1, promise2, promise3]
// let seconds = 4000

// const result = reqs.reduce((prevPr, currArg, idx) => {
//   seconds = (1000 * (idx + 1))
//   return prevPr.then((acc) => currArg().then((resp) => [...acc, resp])
//   );
// }, Promise.resolve([]))


// result.then(console.log)
// // async function invokePromises() {
// //   for (let idx = 0; idx < promises.length; idx++) {
// //     await promises[idx]
// //   }
// // }

// // invokePromises()
