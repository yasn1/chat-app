const colors = {
    red:"\x1b[31m",
    green:"\x1b[32m",
    yellow:"\x1b[33m",
    blue:"\x1b[34m",
    fix:"\x1b[0m"
}

const log = (...args) => {
    const color = colors[args[0]] || colors.fix;
    args = args.slice(1).toString();
    console.log(`${colors.blue}[ Sysem ] `+color+args,colors.fix)
}
module.exports = log;