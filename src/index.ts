import { writeFileSync, readFileSync } from 'fs'
import { NWCPackageManager } from 'nwc-package'
import { INWCConnectionInfo, NWCTenant, INWCWorkflowSource, INWCWorkflowAction, INWCDataSource } from 'nwc-sdk'
import * as sourceConnectionConfig from './source-tenant.json'
import * as targetConnectionConfig from './target-tenant.json'
const key = 'TAGNAME'

class NwcSdkDemo {
	public static async getTenant(): Promise<NWCTenant> {
		const tenant = new NWCTenant()
		tenant.setLogging(true)
		await tenant.connect(sourceConnectionConfig)
		writeFileSync(`./output/${tenant.tenantInfo.name}-info.json`, JSON.stringify(tenant))
		return tenant
	}

	public static async createPackage(key: string): Promise<NWCPackageManager> {
		const nwcPackageManager = new NWCPackageManager(key)
		nwcPackageManager.setLogging(true, true)
		await nwcPackageManager.connect(sourceConnectionConfig)
		await nwcPackageManager.buildPackage(false, './output')
		writeFileSync(`./output/${nwcPackageManager.package.key}-package.json`, JSON.stringify(nwcPackageManager.package))
		return nwcPackageManager
	}

	public static async deployPackage(key: string, reuseExistingWorkflows: boolean) {
		const targetConnections = JSON.parse(readFileSync(`./src/${targetConnectionConfig.tenantName}.${key}.connections.json`, 'utf-8')) as INWCConnectionInfo[]
		const targetDatasources = JSON.parse(readFileSync(`./src/${targetConnectionConfig.tenantName}.${key}.datasources.json`, 'utf-8')) as INWCDataSource[]
		const nwcPackageManager = new NWCPackageManager(undefined, NWCPackageManager.loadPackage(`./output/${key}-package.json`))
		nwcPackageManager.setLogging(true, true)
		await nwcPackageManager.connect(targetConnectionConfig)
		const outcome = await nwcPackageManager.deploy(targetConnections, targetDatasources, reuseExistingWorkflows)
		writeFileSync(`./output/${nwcPackageManager.package.key}-${nwcPackageManager.tenant.tenantInfo.name}-deployment.json`, JSON.stringify(outcome))
	}

	public static async getConnectionsForTenant(key: string) {
		const nwcPackageManager = new NWCPackageManager(undefined, NWCPackageManager.loadPackage(`./output/${key}-package.json`))
		nwcPackageManager.setLogging(true, true)
		await nwcPackageManager.connect(targetConnectionConfig)
		const connections = nwcPackageManager.getMatchingConnectionInfos()
		const dataSources = nwcPackageManager.getMatchingDatasources()
		writeFileSync(`./output/${targetConnectionConfig.tenantName}.${key}.connections.json`, JSON.stringify(connections))
		writeFileSync(`./output/${targetConnectionConfig.tenantName}.${key}.datasources.json`, JSON.stringify(dataSources))
	}
}

//NwcSdkDemo.getTenant()
//NwcSdkDemo.createPackage(key)
//NwcSdkDemo.getConnectionsForTenant(key)
//NwcSdkDemo.deployPackage(key, false)
//NwcSdkDemo.deployPackage(key, true)
