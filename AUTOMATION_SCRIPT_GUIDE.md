# 🤖 WOWSTORE AUTOMATION SCRIPT GUIDE

**Script**: `wowstore-deploy-and-cleanup.sh`  
**Purpose**: Fully automated deployment of Ciseco theme + cleanup of old resources  
**Time**: 30-45 minutes (mostly automated)

---

## 🚀 QUICK START

### **Step 1: Upload Script to Google Cloud Shell**

1. Open Google Cloud Shell: https://console.cloud.google.com/
2. Click the "Upload file" button (⬆️ icon)
3. Upload `wowstore-deploy-and-cleanup.sh`

**OR** download directly:

```bash
# In Google Cloud Shell
wget https://raw.githubusercontent.com/Wowstorelive/wowstore-hydrogen-storefront/main/wowstore-deploy-and-cleanup.sh
chmod +x wowstore-deploy-and-cleanup.sh
```

### **Step 2: Run the Script**

```bash
./wowstore-deploy-and-cleanup.sh
```

### **Step 3: Follow the Prompts**

The script will ask for confirmation at key points:
- Do you want to proceed?
- Do you want to clean up old resources?
- Delete specific old deployments?
- Edit .env file?

---

## 📋 WHAT THE SCRIPT DOES

### **Phase 1: Pre-flight Checks** ✈️
- Verifies gcloud CLI is installed
- Verifies kubectl is installed
- Sets correct GCP project
- Gets cluster credentials

### **Phase 2: Cleanup Old Resources** 🧹
- Lists all deployments
- Identifies old Hydrogen deployments
- Deletes old deployments (with confirmation)
- Deletes old services
- Cleans up old Docker images in GCR
- Removes unused PVCs

### **Phase 3: Setup Ciseco Theme** 📦
- Creates working directory
- Clones GitHub repository
- Checks for .env file
- Prompts for Shopify credentials if needed

### **Phase 4: Build Docker Image** 🐳
- Creates Dockerfile (if missing)
- Builds Docker image using Cloud Build
- Pushes to Google Container Registry

### **Phase 5: Create Kubernetes Manifests** 📝
- Creates deployment.yaml
- Creates service.yaml (LoadBalancer)
- Creates ingress.yaml
- Creates managed certificate for SSL

### **Phase 6: Create Secrets** 🔐
- Reads .env file
- Creates Kubernetes secret with Shopify credentials

### **Phase 7: Deploy to Kubernetes** 🚀
- Applies all manifests
- Waits for deployment to be ready
- Creates load balancer
- Provisions SSL certificate

### **Phase 8: Verify Deployment** ✅
- Checks pod status
- Gets external IP address
- Verifies service is running
- Checks SSL certificate status

### **Phase 9: Post-Deployment Summary** 📊
- Shows next steps
- Provides useful commands
- Displays external IP for DNS configuration

---

## 🔧 CONFIGURATION

The script uses these default values (you can edit them in the script):

```bash
PROJECT_ID="wowstore-ai-media-agent"
CLUSTER_NAME="autopilot-cluster-wowstoreain8ndocker"
REGION="europe-west2"
REPO_URL="https://github.com/Wowstorelive/Cisec_Hydrogen_Storefront.git"
APP_NAME="ciseco-hydrogen"
NAMESPACE="default"
```

---

## 📝 REQUIRED ENVIRONMENT VARIABLES

Create a `.env` file in the Ciseco theme directory with:

```bash
PUBLIC_STOREFRONT_ID=your_storefront_id
PUBLIC_STOREFRONT_API_TOKEN=your_api_token
PRIVATE_STOREFRONT_API_TOKEN=your_private_token
PUBLIC_CUSTOMER_ACCOUNT_API_CLIENT_ID=your_client_id
PUBLIC_CUSTOMER_ACCOUNT_API_URL=your_api_url
```

**How to get these values:**

1. Go to Shopify Admin → Settings → Apps and sales channels
2. Click on "Hydrogen" app
3. Click on "Create storefront" or select existing one
4. Copy the credentials

**OR** run this in your local Hydrogen project:

```bash
npx shopify hydrogen link
npx shopify hydrogen env pull
cat .env
```

---

## 🐛 TROUBLESHOOTING

### **Issue: "gcloud: command not found"**
**Solution**: You must run this in Google Cloud Shell, not your local terminal.

### **Issue: "Permission denied"**
**Solution**: Make the script executable:
```bash
chmod +x wowstore-deploy-and-cleanup.sh
```

### **Issue: "Cluster not found"**
**Solution**: Update the `CLUSTER_NAME` and `REGION` in the script to match your cluster.

### **Issue: "Build failed"**
**Solution**: Check that:
- `package.json` exists in the repository
- All dependencies are valid
- No syntax errors in the code

### **Issue: "Pods not starting"**
**Solution**: Check logs:
```bash
kubectl logs -f deployment/ciseco-hydrogen
```

### **Issue: "External IP not assigned"**
**Solution**: Wait a few minutes, then check:
```bash
kubectl get service ciseco-hydrogen-service
```

### **Issue: "SSL certificate not provisioning"**
**Solution**: 
1. Verify DNS is pointing to the external IP
2. Wait 15-30 minutes for Google to provision the certificate
3. Check status:
```bash
kubectl describe managedcertificate wowstore-ssl-cert
```

---

## 🎯 POST-DEPLOYMENT CHECKLIST

After the script completes:

- [ ] Note the external IP address
- [ ] Update DNS A record for wowstore.live to point to external IP
- [ ] Update DNS A record for www.wowstore.live to point to external IP
- [ ] Wait 15-30 minutes for SSL certificate provisioning
- [ ] Test site at http://EXTERNAL_IP
- [ ] Test site at https://wowstore.live (after DNS propagates)
- [ ] Verify all pages load correctly
- [ ] Check that products are displaying
- [ ] Test cart functionality
- [ ] Verify mobile responsiveness

---

## 📊 MONITORING COMMANDS

### **Check Deployment Status**
```bash
kubectl get deployments
kubectl rollout status deployment/ciseco-hydrogen
```

### **View Pods**
```bash
kubectl get pods
kubectl describe pod <pod-name>
```

### **View Logs**
```bash
# All pods
kubectl logs -f deployment/ciseco-hydrogen

# Specific pod
kubectl logs -f <pod-name>

# Previous crashed pod
kubectl logs <pod-name> --previous
```

### **Check Service**
```bash
kubectl get service ciseco-hydrogen-service
kubectl describe service ciseco-hydrogen-service
```

### **Check Ingress**
```bash
kubectl get ingress
kubectl describe ingress ciseco-hydrogen-ingress
```

### **Check SSL Certificate**
```bash
kubectl get managedcertificate
kubectl describe managedcertificate wowstore-ssl-cert
```

### **Check Resource Usage**
```bash
kubectl top nodes
kubectl top pods
```

---

## 🔄 UPDATING THE DEPLOYMENT

If you need to update the code:

```bash
# Update code in GitHub
git push origin main

# Rebuild and redeploy
cd ~/ciseco-deployment/Cisec_Hydrogen_Storefront
gcloud builds submit --tag gcr.io/wowstore-ai-media-agent/ciseco-hydrogen:latest .
kubectl rollout restart deployment/ciseco-hydrogen

# Watch the rollout
kubectl rollout status deployment/ciseco-hydrogen
```

---

## 🗑️ MANUAL CLEANUP (if needed)

If you need to remove everything:

```bash
# Delete deployment
kubectl delete deployment ciseco-hydrogen

# Delete service
kubectl delete service ciseco-hydrogen-service

# Delete ingress
kubectl delete ingress ciseco-hydrogen-ingress

# Delete certificate
kubectl delete managedcertificate wowstore-ssl-cert

# Delete secrets
kubectl delete secret shopify-secrets

# Delete Docker images
gcloud container images delete gcr.io/wowstore-ai-media-agent/ciseco-hydrogen:latest
```

---

## 💡 TIPS FOR SUCCESS

1. **Run in Google Cloud Shell**: Don't run this on your local machine - use Google Cloud Shell for best results.

2. **Have Shopify credentials ready**: Make sure you have your Shopify API credentials before starting.

3. **Monitor the process**: Watch the output carefully and address any errors immediately.

4. **Be patient with SSL**: SSL certificate provisioning can take 15-30 minutes. Don't panic if it's not immediate.

5. **Test thoroughly**: After deployment, test all functionality before the Monday meeting.

6. **Keep the script**: Save this script for future deployments and updates.

---

## 🎓 LEARNING RESOURCES

- **Kubernetes Basics**: https://kubernetes.io/docs/tutorials/kubernetes-basics/
- **GKE Documentation**: https://cloud.google.com/kubernetes-engine/docs
- **Shopify Hydrogen**: https://shopify.dev/docs/custom-storefronts/hydrogen
- **Google Cloud Build**: https://cloud.google.com/build/docs

---

## 📞 SUPPORT

If you encounter issues:

1. Check the troubleshooting section above
2. Review the error messages carefully
3. Check logs: `kubectl logs -f deployment/ciseco-hydrogen`
4. Verify all prerequisites are met
5. Consult the documentation links above

---

**Ready to deploy?** Run the script and let the automation handle the rest! 🚀

```bash
./wowstore-deploy-and-cleanup.sh
```

